import { beforeEach, describe, expect, it, vi } from 'vitest';

type Options = {
  load: () => Promise<unknown>;
  render: (game: unknown) => Node[];
  skeleton: () => Node[];
};

const mocks = vi.hoisted(() => ({
  mountAsyncSection: vi.fn<(container: HTMLElement, options: Options) => void>(),
  showDialog: vi.fn(),
  closeDialog: vi.fn(),
  openDialog: vi.fn(),
  showSnackbar: vi.fn(),
  getActiveSession: vi.fn(),
  getGame: vi.fn(),
  toggleFavorite: vi.fn(),
  createStatsBadges: vi.fn(),
  createSkeleton: vi.fn(),
  createCommentsSection: vi.fn(),
  createImageWithFallback: vi.fn(),
  formatRelativeTime: vi.fn(),
}));

vi.mock('../../../../src/utils/mount-sync-section', () => ({
  mountAsyncSection: mocks.mountAsyncSection,
}));
vi.mock('../../../../src/components/dialogs/dialog-backdrop', () => ({
  showDialog: mocks.showDialog,
}));
vi.mock('../../../../src/router/dialog-router', () => ({
  closeDialog: mocks.closeDialog,
  openDialog: mocks.openDialog,
}));
vi.mock('../../../../src/components/snackbar', () => ({ showSnackbar: mocks.showSnackbar }));
vi.mock('../../../../src/api/login-session', () => ({
  getActiveSession: mocks.getActiveSession,
}));
vi.mock('../../../../src/api/endpoints', () => ({
  api: { getGame: mocks.getGame, toggleFavorite: mocks.toggleFavorite },
}));
vi.mock('../../../../src/components/library-page/stats-badges', () => ({
  createStatsBadges: mocks.createStatsBadges,
}));
vi.mock('../../../../src/components/skeleton', () => ({ createSkeleton: mocks.createSkeleton }));
vi.mock('../../../../src/components/dialogs/game-detail-dialog/comments-section', () => ({
  createCommentsSection: mocks.createCommentsSection,
}));

vi.mock('../../../../src/utils/helpers', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../../../src/utils/helpers')>()),
  createImageWithFallback: mocks.createImageWithFallback,
  formatRelativeTime: mocks.formatRelativeTime,
}));

import { openGameDetailDialog } from '../../../../src/components/dialogs/game-detail-dialog/game-detail-dialog';

const game = {
  name: 'Tetris',
  heroImage: 'hero.png',
  fullDescription: 'Stack the blocks',
  rating: 4.5,
  likesCount: 10,
  isLikedByCurrentUser: false,
  specs: { genre: 'Puzzle', players: '1', duration: '5 min', price: 'Free' },
  topRecords: [1, 2, 3, 4].map((position) => ({
    position,
    playerName: `P${position}`,
    score: position * 100,
    achievedAt: 'date',
  })),
};

function open(gameId: string | undefined = 'tetris') {
  openGameDetailDialog(gameId);
  const panel = mocks.showDialog.mock.calls.at(-1)![0] as HTMLElement;
  const [, details] = mocks.mountAsyncSection.mock.calls[0];
  const [, hero] = mocks.mountAsyncSection.mock.calls[1];

  return { panel, details, hero };
}

function renderDetails(overrides: Partial<typeof game> = {}): HTMLElement {
  const { details } = open();
  const container = document.createElement('div');
  container.append(...details.render({ ...game, ...overrides }));
  return container;
}

const favoriteButton = (root: HTMLElement) =>
  root.querySelector<HTMLButtonElement>('.game-detail-dialog__favorite-button')!;

describe('openGameDetailDialog', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.createImageWithFallback.mockImplementation(() => document.createElement('img'));
    mocks.createSkeleton.mockImplementation(() => document.createElement('div'));
    mocks.createStatsBadges.mockImplementation(() => document.createElement('div'));
    mocks.createCommentsSection.mockImplementation(() => document.createElement('div'));
    mocks.formatRelativeTime.mockReturnValue('2 days ago');
    mocks.getActiveSession.mockReturnValue(undefined);
  });

  it('shows the dialog with hero, details, comments and a working close button', () => {
    const { panel } = open('tetris');

    expect(mocks.showDialog).toHaveBeenCalledWith(panel, { ariaLabel: 'Game details' });
    expect(mocks.createCommentsSection).toHaveBeenCalledWith('tetris');
    expect(panel.querySelector('.game-detail-dialog__hero')).not.toBeNull();
    expect(panel.querySelector('.game-detail-dialog__body')).not.toBeNull();

    const close = panel.querySelector<HTMLButtonElement>('.game-detail-dialog__close');
    expect(close?.getAttribute('aria-label')).toBe('Close dialog');
    close?.click();

    expect(mocks.closeDialog).toHaveBeenCalledOnce();
  });

  describe('game loading', () => {
    it('shares one request between hero and details and passes the session email', async () => {
      mocks.getActiveSession.mockReturnValue({ email: 'a@b.c' });
      mocks.getGame.mockResolvedValue(game);
      const { details, hero } = open('tetris');

      await Promise.all([hero.load(), details.load()]);

      expect(mocks.getGame).toHaveBeenCalledExactlyOnceWith('tetris', 'a@b.c');
    });
  });

  describe('rendering', () => {
    it('renders the hero image and skeletons', () => {
      const { hero, details } = open();

      const nodes = hero.render(game);
      expect(nodes).toHaveLength(1);
      expect(mocks.createImageWithFallback).toHaveBeenCalledWith({
        src: 'hero.png',
        alt: 'Tetris',
        className: 'game-detail-dialog__hero-image',
        loading: 'eager',
      });

      expect(hero.skeleton()).toHaveLength(1);
      expect(details.skeleton()).toHaveLength(5);
    });

    it('renders title, description, widgets and records with medals', () => {
      const root = renderDetails();

      expect(root.querySelector('h2')?.textContent).toBe('Tetris');
      expect(mocks.createStatsBadges).toHaveBeenCalledWith(4.5, 10);
      expect(root.querySelector('.game-detail-dialog__description')?.textContent).toBe(
        'Stack the blocks',
      );

      const widgets = [...root.querySelectorAll('.game-detail-dialog__widget')].map(
        (widget) => widget.textContent,
      );
      expect(widgets).toEqual(['GenrePuzzle', 'Players1', 'Duration5 min', 'PriceFree']);
      expect(root.querySelector('.game-detail-dialog__play-button')?.textContent).toBe('Play Now');

      const players = [...root.querySelectorAll('.game-detail-dialog__record-player')].map(
        (player) => player.textContent,
      );
      expect(players).toEqual(['🥇P1', '🥈P2', '🥉P3', '4P4']);
      expect(root.querySelector('.game-detail-dialog__record-result')?.textContent).toBe(
        '1002 days ago',
      );
    });
  });

  describe('favorites', () => {
    it('asks guests to log in', () => {
      const button = favoriteButton(renderDetails());

      button.click();

      expect(mocks.openDialog).toHaveBeenCalledWith({ auth: 'login' });
      expect(mocks.showSnackbar).toHaveBeenCalledWith({
        variant: 'warning',
        message: 'Log in to add games to favorites',
      });
      expect(mocks.toggleFavorite).not.toHaveBeenCalled();
    });

    it('toggles the favorite state for a logged-in user', async () => {
      mocks.getActiveSession.mockReturnValue({ email: 'a@b.c' });
      mocks.toggleFavorite.mockResolvedValue({ isFavorited: true });
      const root = renderDetails();
      const button = favoriteButton(root);
      expect(button.textContent).toBe('Add to Favorites');

      button.click();
      expect(button.disabled).toBe(true);
      expect(button.className).toContain('--pending');

      await vi.waitFor(() => expect(button.disabled).toBe(false));
      expect(mocks.toggleFavorite).toHaveBeenCalledWith('tetris', 'a@b.c');
      expect(button.textContent).toBe('Remove from Favorites');
      expect(button.querySelector('.game-detail-dialog__favorite-icon--active')).not.toBeNull();
      expect(button.className).not.toContain('--pending');
    });

    it('starts in the favorited state and ignores clicks while a request is pending', async () => {
      mocks.getActiveSession.mockReturnValue({ email: 'a@b.c' });
      let resolve!: (value: { isFavorited: boolean }) => void;
      mocks.toggleFavorite.mockReturnValue(new Promise((r) => (resolve = r)));
      const button = favoriteButton(renderDetails({ isLikedByCurrentUser: true }));
      expect(button.textContent).toBe('Remove from Favorites');

      button.click();
      button.click();
      expect(mocks.toggleFavorite).toHaveBeenCalledOnce();

      resolve({ isFavorited: false });
      await vi.waitFor(() => expect(button.textContent).toBe('Add to Favorites'));
    });
  });
});
