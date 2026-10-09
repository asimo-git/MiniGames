import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mountAsyncSection } = vi.hoisted(() => ({
  mountAsyncSection: vi.fn(
    async (
      container: HTMLElement,
      options: {
        load: () => Promise<unknown>;
        render: (data: unknown) => HTMLElement[];
        skeleton: () => HTMLElement[];
      },
    ) => {
      container.replaceChildren(...options.skeleton());
      const data = await options.load();
      container.replaceChildren(...options.render(data));
    },
  ),
}));

vi.mock('../../../../src/utils/mount-sync-section', () => ({ mountAsyncSection }));
vi.mock('../../../../src/components/skeleton', () => ({
  createSkeleton: vi.fn(() => document.createElement('div')),
}));
vi.mock('../../../../src/api/endpoints', () => ({
  api: { getComments: vi.fn(), createComment: vi.fn(), toggleCommentLike: vi.fn() },
}));
vi.mock('../../../../src/api/client', () => ({
  ApiError: class ApiError extends Error {},
}));
vi.mock('../../../../src/api/login-session', () => ({ getActiveSession: vi.fn() }));
vi.mock('../../../../src/components/snackbar', () => ({ showSnackbar: vi.fn() }));
vi.mock('../../../../src/router/dialog-router', () => ({ openDialog: vi.fn() }));

import { api } from '../../../../src/api/endpoints';
import { getActiveSession } from '../../../../src/api/login-session';
import { createCommentsSection } from '../../../../src/components/dialogs/game-detail-dialog/comments-section';
import { showSnackbar } from '../../../../src/components/snackbar';
import { openDialog } from '../../../../src/router/dialog-router';

const SESSION = { email: 'a@b.c', displayName: 'Ann' };

const COMMENT = {
  commentId: 'c1',
  authorName: 'Bob',
  text: 'Great game',
  createdAt: new Date().toISOString(),
  likesCount: 2,
  isLikedByCurrentUser: false,
};

const flush = (): Promise<void> => new Promise((resolve) => setTimeout(resolve, 0));

function mockComments(comments: unknown[]): void {
  vi.mocked(api.getComments).mockResolvedValue({
    data: comments,
    meta: { totalComments: comments.length },
  } as never);
}

async function mountSection(options: { session?: typeof SESSION; comments?: unknown[] } = {}) {
  vi.mocked(getActiveSession).mockReturnValue(options.session as never);
  mockComments(options.comments ?? [COMMENT]);

  const section = createCommentsSection('tetris');
  await flush();

  return section;
}

function getInput(section: HTMLElement): HTMLTextAreaElement {
  return section.querySelector('.game-detail-dialog__comment-input') as HTMLTextAreaElement;
}

function getSendButton(section: HTMLElement): HTMLButtonElement {
  return section.querySelector('.game-detail-dialog__send-button') as HTMLButtonElement;
}

function typeText(section: HTMLElement, text: string): void {
  const input = getInput(section);
  input.value = text;
  input.dispatchEvent(new Event('input'));
}

describe('createCommentsSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('list', () => {
    it('loads recent comments and renders title and cards without a form for guests', async () => {
      const section = await mountSection();

      expect(api.getComments).toHaveBeenCalledWith('tetris', {
        limit: 3,
        sort: 'newest',
        userEmail: undefined,
      });
      expect(section.querySelector('h3')?.textContent).toBe('Comments (1)');
      expect(section.querySelectorAll('.game-detail-dialog__comment')).toHaveLength(1);
      expect(section.querySelector('.game-detail-dialog__comment-username')?.textContent).toBe(
        'Bob',
      );
      expect(section.querySelector('.game-detail-dialog__avatar')?.textContent).toBe('B');
      expect(getInput(section)).toBeNull();
    });

    it('shows the empty state when there are no comments', async () => {
      const section = await mountSection({ comments: [] });

      expect(section.textContent).toContain('There are no comments yet');
      expect(section.querySelector('ul')).toBeNull();
    });
  });

  describe('new comment form', () => {
    it('is rendered for a logged-in user and enables the button only for valid text', async () => {
      const section = await mountSection({ session: SESSION });

      expect(getInput(section)).not.toBeNull();
      expect(getSendButton(section).disabled).toBe(true);

      typeText(section, 'Hello');
      expect(getSendButton(section).disabled).toBe(false);

      typeText(section, '   ');
      expect(getSendButton(section).disabled).toBe(true);

      typeText(section, 'a'.repeat(501));
      expect(getSendButton(section).disabled).toBe(true);
    });

    it('sends the trimmed comment, shows a snackbar and reloads the list', async () => {
      vi.mocked(api.createComment).mockResolvedValue(undefined as never);
      const section = await mountSection({ session: SESSION });

      typeText(section, '  Hello  ');
      getSendButton(section).click();
      await flush();

      expect(api.createComment).toHaveBeenCalledWith('tetris', {
        userEmail: 'a@b.c',
        authorName: 'Ann',
        text: 'Hello',
      });
      expect(showSnackbar).toHaveBeenCalledWith({
        message: 'Comment sent successfully.',
        variant: 'success',
      });
      expect(api.getComments).toHaveBeenCalledTimes(2);
    });

    it('submits on Enter but not on Shift+Enter', async () => {
      vi.mocked(api.createComment).mockResolvedValue(undefined as never);
      const section = await mountSection({ session: SESSION });
      typeText(section, 'Hello');

      getInput(section).dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Enter', shiftKey: true }),
      );
      await flush();
      expect(api.createComment).not.toHaveBeenCalled();

      getInput(section).dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
      await flush();
      expect(api.createComment).toHaveBeenCalledOnce();
    });
  });

  describe('likes', () => {
    const getLikeButton = (section: HTMLElement): HTMLButtonElement =>
      section.querySelector('.game-detail-dialog__comment-like-button') as HTMLButtonElement;

    it('asks guests to log in', async () => {
      const section = await mountSection();

      getLikeButton(section).click();
      await flush();

      expect(openDialog).toHaveBeenCalledWith({ auth: 'login' });
      expect(showSnackbar).toHaveBeenCalledWith({
        variant: 'warning',
        message: 'Log in to like comments',
      });
      expect(api.toggleCommentLike).not.toHaveBeenCalled();
    });

    it('updates the counter and active state after a successful toggle', async () => {
      vi.mocked(api.toggleCommentLike).mockResolvedValue({
        isLikedByCurrentUser: true,
        likesCount: 3,
      } as never);
      const section = await mountSection({ session: SESSION });

      getLikeButton(section).click();
      await flush();

      const likes = section.querySelector('.game-detail-dialog__comment-likes') as HTMLElement;
      expect(api.toggleCommentLike).toHaveBeenCalledWith('c1', 'a@b.c');
      expect(likes.classList.contains('game-detail-dialog__comment-likes--active')).toBe(true);
      expect(likes.querySelector('span')?.textContent).toBe('3');
      expect(getLikeButton(section).disabled).toBe(false);
    });

    it('shows an error and keeps the counter when the toggle fails', async () => {
      vi.mocked(api.toggleCommentLike).mockRejectedValue(new Error('network'));
      const section = await mountSection({ session: SESSION });

      getLikeButton(section).click();
      await flush();

      expect(showSnackbar).toHaveBeenCalledWith({
        variant: 'error',
        message: 'Failed to update like. Try again.',
      });
      expect(section.querySelector('.game-detail-dialog__comment-likes span')?.textContent).toBe(
        '2',
      );
    });
  });
});
