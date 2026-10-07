import { mountAsyncSection } from '../../../utils/mount-sync-section';
import { createElement, formatRelativeTime } from '../../../utils/helpers';
import { api } from '../../../api/endpoints';
import { ApiError } from '../../../api/client';
import { createSkeleton } from '../../skeleton';
import type { GameComment, ListResponse, CommentsMeta } from '../../../api/types';
import { getActiveSession, type AppSession } from '../../../api/login-session';
import { showSnackbar } from '../../../components/snackbar';
import { openDialog } from '../../../router/dialog-router';

const TEXTAREA_MAX_HEIGHT_PX = 76;
const AUTHOR_NAME_MAX_LENGTH = 30;
const COMMENT_TEXT_MAX_LENGTH = 500;
const RECENT_COMMENTS_LIMIT = 3;

export function createCommentsSection(slug: string): HTMLElement {
  const container = createElement('section', {
    className: 'game-detail-dialog__comments',
  });

  const session = getActiveSession();
  void mountComments(container, slug, session);

  return container;
}

function mountComments(
  container: HTMLElement,
  slug: string,
  session: AppSession | undefined,
): Promise<void> {
  return mountAsyncSection(container, {
    load: () =>
      api.getComments(slug, {
        limit: RECENT_COMMENTS_LIMIT,
        sort: 'newest',
        userEmail: session?.email,
      }),
    render: (comments) => renderSection(slug, comments, container, session),
    skeleton: createCommentsSkeleton,
  });
}

function renderSection(
  slug: string,
  comments: ListResponse<GameComment, CommentsMeta>,
  container: HTMLElement,
  session?: AppSession,
): HTMLElement[] {
  const refresh = (): Promise<void> => mountComments(container, slug, session);

  const items: HTMLElement[] = [
    createElement('h3', {
      className: 'game-detail-dialog__section-title',
      textContent: `Comments (${comments.meta.totalComments})`,
    }),
  ];

  if (session) {
    items.push(createNewCommentRow(slug, refresh, session));
  }

  items.push(
    comments.data.length === 0
      ? createElement('p', {
          textContent: 'There are no comments yet. Be the first to comment!',
        })
      : createElement('ul', {
          className: 'game-detail-dialog__comment-list',
          children: comments.data.map((comment) => createCommentCard(comment, session)),
        }),
  );

  return items;
}

////////////////////////////////////
// New comment form
////////////////////////////////////

function createNewCommentRow(
  slug: string,
  onSubmitted: () => Promise<void>,
  session: AppSession,
): HTMLElement {
  const commentInput = createElement('textarea', {
    className: 'game-detail-dialog__comment-input',
    attributes: { rows: '1', placeholder: 'Write a comment...', maxlength: '500' },
  });

  const sendButton = createElement('button', {
    className: 'game-detail-dialog__send-button',
    attributes: { type: 'button', 'aria-label': 'Send comment', disabled: '' },
    children: [createElement('span', { className: 'game-detail-dialog__send-icon' })],
  });

  const inputWrapper = createElement('div', {
    className: 'game-detail-dialog__input-wrapper',
    children: [commentInput],
  });

  let isSending = false;

  const updateSendButtonState = (): void => {
    const length = commentInput.value.trim().length;
    sendButton.disabled = isSending || length === 0 || length > COMMENT_TEXT_MAX_LENGTH;
  };

  commentInput.addEventListener('input', () => {
    commentInput.style.height = 'auto';
    commentInput.style.height = `${Math.min(commentInput.scrollHeight, TEXTAREA_MAX_HEIGHT_PX)}px`;
    updateSendButtonState();
  });

  commentInput.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter' || event.shiftKey) {
      return;
    }

    event.preventDefault();
    void submitComment();
  });

  sendButton.addEventListener('click', () => {
    void submitComment();
  });

  async function submitComment(): Promise<void> {
    const text = commentInput.value.trim();
    if (isSending || text.length === 0) {
      return;
    }

    setSending(true);

    try {
      await api.createComment(slug, {
        userEmail: session.email,
        authorName: session?.displayName.slice(0, AUTHOR_NAME_MAX_LENGTH) || '',
        text,
      });

      commentInput.value = '';
      commentInput.style.height = 'auto';
      showSnackbar({ message: 'Comment sent successfully.', variant: 'success' });
      await onSubmitted();
      return;
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : 'Failed to send comment.Try again.';
      showSnackbar({ message, variant: 'error' });
    } finally {
      setSending(false);
    }
  }

  function setSending(isPending: boolean): void {
    isSending = isPending;
    commentInput.disabled = isPending;
    updateSendButtonState();
  }

  return createElement('div', {
    className: 'game-detail-dialog__new-comment',
    children: [
      createElement('span', {
        className: 'game-detail-dialog__avatar',
        textContent: session?.displayName.charAt(0).toUpperCase() || 'U',
      }),
      inputWrapper,
      sendButton,
    ],
  });
}

function createCommentHeader(comment: GameComment): HTMLElement {
  const avatar = createElement('span', {
    className: 'game-detail-dialog__avatar',
    textContent: comment.authorName.charAt(0).toUpperCase(),
  });
  return createElement('div', {
    className: 'game-detail-dialog__comment-header',
    children: [
      createElement('div', {
        className: 'game-detail-dialog__comment-author',
        children: [
          avatar,
          createElement('span', {
            className: 'game-detail-dialog__comment-username',
            textContent: comment.authorName,
          }),
        ],
      }),
      createElement('span', {
        className: 'game-detail-dialog__comment-time',
        textContent: formatRelativeTime(comment.createdAt),
      }),
    ],
  });
}

function createCommentCard(comment: GameComment, session?: AppSession): HTMLElement {
  return createElement('li', {
    className: 'game-detail-dialog__comment',
    children: [
      createCommentHeader(comment),
      createElement('p', {
        className: 'game-detail-dialog__comment-text',
        textContent: comment.text,
      }),
      createCommentLikes(comment, session),
    ],
  });
}

function createCommentLikes(comment: GameComment, session: AppSession | undefined): HTMLElement {
  let likesCount = comment.likesCount;
  let isLiked = comment.isLikedByCurrentUser;
  let isPending = false;

  const commentLikeButton = createElement('button', {
    className: 'game-detail-dialog__comment-like-button',
    attributes: { type: 'button' },
  });
  const likesCounter = createElement('span', { textContent: String(likesCount) });

  const commentLikesContainer = createElement('div', {
    className: `game-detail-dialog__comment-likes${isLiked ? ' game-detail-dialog__comment-likes--active' : ''}`,
    children: [commentLikeButton, likesCounter],
  });

  commentLikeButton.addEventListener('click', () => {
    void handleLikeClick();
  });

  async function handleLikeClick(): Promise<void> {
    if (isPending) return;

    if (!session) {
      showSnackbar({ variant: 'warning', message: 'Log in to like comments' });
      openDialog({ auth: 'login' });
      return;
    }

    isPending = true;
    commentLikeButton.disabled = true;
    commentLikeButton.classList.add('game-detail-dialog__comment-like-button--loading');

    try {
      const result = await api.toggleCommentLike(comment.commentId, session.email);
      isLiked = result.isLikedByCurrentUser;
      likesCount = result.likesCount;
      commentLikesContainer.classList.toggle('game-detail-dialog__comment-likes--active', isLiked);
      likesCounter.textContent = String(likesCount);
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : 'Failed to update like. Try again.';
      showSnackbar({ variant: 'error', message });
    } finally {
      isPending = false;
      commentLikeButton.disabled = false;
      commentLikeButton.classList.remove('game-detail-dialog__comment-like-button--loading');
    }
  }

  return commentLikesContainer;
}

/////////////////////////////////
// Skeletons
/////////////////////////////////
function createCommentsSkeleton(): HTMLElement[] {
  return [
    createSkeleton({
      width: '100%',
      height: '84px',
      className: 'game-detail-dialog__new-comment',
    }),
    createSkeleton({
      width: '100%',
      height: '128px',
      className: 'game-detail-dialog__comment-list',
    }),
  ];
}
