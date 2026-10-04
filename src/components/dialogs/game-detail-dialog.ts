import { mountAsyncSection } from '../../utils/mount-sync-section';
import closeIcon from '../../assets/icons/close.svg';
import { createElement, createImageWithFallback, formatRelativeTime } from '../../utils/helpers';
import { createStatsBadges } from '../library-page/stats-badges';
import { showDialog } from './dialog-backdrop';
import { api } from '../../api/endpoints';
import { createSkeleton } from '../skeleton';
import type { GameDetails, GameComment } from '../../api/types';
import { closeDialog } from '../../router/dialog-router';
import { showSnackbar } from '../snackbar';

// TODO: Change to real author initial
const NEW_COMMENT_AUTHOR_INITIAL = 'U';
const TEXTAREA_MAX_HEIGHT_PX = 76;

export function openGameDetailDialog(gameId: string | undefined): void {
  const panel = createContent(gameId, () => {
    closeDialog();
  });

  showDialog(panel, { ariaLabel: 'Game details' });
}

function createGameLoader(slug: string): () => Promise<GameDetails> {
  let promise: Promise<GameDetails> | undefined;

  async function fetchGame(): Promise<GameDetails> {
    try {
      return await api.getGame(slug);
    } catch (error) {
      promise = undefined;
      throw error;
    }
  }

  return () => {
    promise ??= fetchGame();
    return promise;
  };
}

function createContent(gameId: string | undefined, onClose: () => void): HTMLElement {
  const slug = gameId ?? '';
  const gamePromise = createGameLoader(slug);

  const body = createElement('div', {
    className: 'game-detail-dialog__body',
    children: [createDetails(gamePromise), createCommentsSection(slug)],
  });

  return createElement('div', {
    className: 'game-detail-dialog',
    children: [createHero(gamePromise), body, createCloseButton(onClose)],
  });
}

function createHero(gamePromise: () => Promise<GameDetails>): HTMLElement {
  const container = createElement('div', { className: 'game-detail-dialog__hero' });

  void mountAsyncSection(container, {
    // load: () => new Promise(() => {}),
    // load: () => Promise.reject(new Error('Error')),
    load: gamePromise,
    render: (game) => {
      const img = createImageWithFallback({
        src: game.heroImage,
        alt: game.name,
        className: 'game-detail-dialog__hero-image',
        loading: 'eager',
      });
      return [img];
    },
    skeleton: () => [
      createSkeleton({
        width: '100%',
        className: 'game-detail-dialog__hero-image',
      }),
    ],
  });

  return container;
}

function createDetails(gamePromise: () => Promise<GameDetails>): HTMLElement {
  const container = createElement('div', { className: 'game-detail-dialog__details' });

  void mountAsyncSection(container, {
    // load: () => new Promise(() => {}),
    load: gamePromise,
    // load: () => Promise.reject(new Error('Error')),
    render: (game) => [
      createTitleRow(game),
      createElement('p', {
        className: 'game-detail-dialog__description',
        textContent: game.fullDescription,
      }),
      createInfoWidgets(game),
      createActions(game),
      createRecordsSection(game),
    ],
    skeleton: createDetailsSkeleton,
  });

  return container;
}

function createDetailsSkeleton(): HTMLElement[] {
  return [
    createSkeleton({
      width: '100%',
      height: '44px',
      className: 'game-detail-dialog__title-row',
    }),
    createSkeleton({
      width: '100%',
      height: '100px',
      className: 'game-detail-dialog__description',
    }),
    createSkeleton({
      width: '100%',
      height: '58px',
      className: 'game-detail-dialog__widgets',
    }),
    createSkeleton({
      width: '100%',
      height: '48px',
      className: 'game-detail-dialog__actions',
    }),
    createSkeleton({
      width: '100%',
      height: '200px',
      className: 'game-detail-dialog__records',
    }),
  ];
}

function createCommentsSection(slug: string): HTMLElement {
  const container = createElement('section', {
    className: 'game-detail-dialog__comments',
  });

  void mountAsyncSection(container, {
    // load: () => new Promise(() => {}),
    // load: () => Promise.reject(new Error('Error')),
    load: () => api.getComments(slug, { limit: 3, sort: 'newest' }),
    render: (comments) => [
      createElement('h3', {
        className: 'game-detail-dialog__section-title',
        textContent: `Comments (${comments.meta.totalComments})`,
      }),
      createNewCommentRow(),
      comments.data.length === 0
        ? createElement('p', {
            textContent: 'There are no comments yet. Be the first to comment!',
          })
        : createElement('ul', {
            className: 'game-detail-dialog__comment-list',
            children: comments.data.map((comment) => createCommentCard(comment)),
          }),
    ],
    skeleton: createCommentsSkeleton,
  });

  return container;
}

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

///////////////////////////
// synchronous elements
///////////////////////////

function createCloseButton(onClose: () => void): HTMLButtonElement {
  const button = createElement('button', {
    className: 'game-detail-dialog__close',
    attributes: { type: 'button', 'aria-label': 'Close dialog' },
    children: [createElement('img', { attributes: { src: closeIcon, alt: '' } })],
  });

  button.addEventListener('click', onClose);
  return button;
}

function createTitleRow(game: GameDetails): HTMLElement {
  return createElement('div', {
    className: 'game-detail-dialog__title-row',
    children: [
      createElement('h2', { className: 'game-detail-dialog__title', textContent: game.name }),
      createStatsBadges(game.rating, game.likesCount),
    ],
  });
}

function createInfoWidgets(game: GameDetails): HTMLElement {
  const { genre, players, duration, price } = game.specs;
  const widgets = [
    { label: 'Genre', value: genre },
    { label: 'Players', value: players },
    { label: 'Duration', value: duration },
    { label: 'Price', value: price },
  ].map((item) => createInfoWidget(item));

  return createElement('div', { className: 'game-detail-dialog__widgets', children: widgets });
}

function createInfoWidget(widget: { label: string; value: string }): HTMLElement {
  return createElement('div', {
    className: 'game-detail-dialog__widget',
    children: [
      createElement('span', {
        className: 'game-detail-dialog__widget-label',
        textContent: widget.label,
      }),
      createElement('span', {
        className: 'game-detail-dialog__widget-value',
        textContent: widget.value,
      }),
    ],
  });
}

function createActions(game: GameDetails): HTMLElement {
  let isFavorite = game.isLikedByCurrentUser;

  const labelSpan = createElement('span', {
    textContent: isFavorite ? 'Remove from Favorites' : 'Add to Favorites',
  });
  const buttonIcon = createElement('span', {
    className: `game-detail-dialog__favorite-icon${isFavorite ? ' game-detail-dialog__favorite-icon--active' : ''}`,
  });
  const addToFavoritesButton = createElement('button', {
    className: 'game-detail-dialog__favorite-button',
    attributes: { type: 'button' },
    children: [buttonIcon, labelSpan],
  });

  addToFavoritesButton.addEventListener('click', () => {
    isFavorite = !isFavorite;
    buttonIcon.classList.toggle('game-detail-dialog__favorite-icon--active', isFavorite);
    labelSpan.textContent = isFavorite ? 'Remove from Favorites' : 'Add to Favorites';
    showSnackbar({ variant: 'info', message: 'Adding to favorites will be implemented later' });
  });

  return createElement('div', {
    className: 'game-detail-dialog__actions',
    children: [
      createElement('button', {
        className: 'game-detail-dialog__play-button',
        textContent: 'Play Now',
        attributes: { type: 'button' },
      }),
      addToFavoritesButton,
    ],
  });
}

function createRecordsSection(game: GameDetails): HTMLElement {
  const records = game.topRecords.map((record) => createRecordRow(record));

  return createElement('section', {
    className: 'game-detail-dialog__records',
    children: [
      createElement('h3', {
        className: 'game-detail-dialog__section-title',
        children: [
          createElement('span', { attributes: { 'aria-hidden': 'true' }, textContent: '🏆' }),
          createElement('span', { textContent: 'Top Records' }),
        ],
      }),
      createElement('ul', { className: 'game-detail-dialog__record-list', children: records }),
    ],
  });
}

function createRecordRow(record: GameDetails['topRecords'][number]): HTMLElement {
  const player = createRecordPlayer(record);
  const result = createRecordResult(record);

  return createElement('li', {
    className: 'game-detail-dialog__record',
    children: [player, result],
  });
}

function createRecordPlayer(record: GameDetails['topRecords'][number]): HTMLElement {
  const medal = createElement('span', {
    attributes: { 'aria-hidden': 'true' },
    textContent:
      record.position === 1
        ? '🥇'
        : record.position === 2
          ? '🥈'
          : record.position === 3
            ? '🥉'
            : String(record.position),
  });
  const name = createElement('span', { textContent: record.playerName });

  return createElement('span', {
    className: 'game-detail-dialog__record-player',
    children: [medal, name],
  });
}

function createRecordResult(record: GameDetails['topRecords'][number]): HTMLElement {
  const score = createElement('span', {
    className: 'game-detail-dialog__record-score',
    textContent: String(record.score),
  });
  const time = createElement('span', {
    className: 'game-detail-dialog__record-time',
    textContent: formatRelativeTime(record.achievedAt),
  });

  return createElement('span', {
    className: 'game-detail-dialog__record-result',
    children: [score, time],
  });
}

////////////////////////////////////
// Comments section
////////////////////////////////////

function createNewCommentRow(): HTMLElement {
  const commentInput = createElement('textarea', {
    className: 'game-detail-dialog__comment-input',
    attributes: { rows: '1', placeholder: 'Write a comment...' },
  });

  const inputWrapper = createElement('div', {
    className: 'game-detail-dialog__input-wrapper',
    children: [commentInput],
  });

  const sendButton = createElement('button', {
    className: 'game-detail-dialog__send-button',
    attributes: { type: 'button', 'aria-label': 'Send comment', disabled: '' },
    children: [createElement('span', { className: 'game-detail-dialog__send-icon' })],
  });

  commentInput.addEventListener('input', () => {
    commentInput.style.height = 'auto';
    commentInput.style.height = `${Math.min(commentInput.scrollHeight, TEXTAREA_MAX_HEIGHT_PX)}px`;
    sendButton.disabled = commentInput.value.trim().length === 0;
  });

  return createElement('div', {
    className: 'game-detail-dialog__new-comment',
    children: [
      createElement('span', {
        className: 'game-detail-dialog__avatar',
        textContent: NEW_COMMENT_AUTHOR_INITIAL,
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

function createCommentLikes(comment: GameComment): HTMLElement {
  let likesCount = comment.likesCount;
  let isLiked = comment.isLikedByCurrentUser;

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
    isLiked = !isLiked;
    likesCount += isLiked ? 1 : -1;
    commentLikesContainer.classList.toggle('game-detail-dialog__comment-likes--active', isLiked);
    likesCounter.textContent = String(likesCount);
  });

  return commentLikesContainer;
}

function createCommentCard(comment: GameComment): HTMLElement {
  return createElement('li', {
    className: 'game-detail-dialog__comment',
    children: [
      createCommentHeader(comment),
      createElement('p', {
        className: 'game-detail-dialog__comment-text',
        textContent: comment.text,
      }),
      createCommentLikes(comment),
    ],
  });
}
