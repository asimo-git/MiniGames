import closeIcon from '../../assets/icons/close.svg';
import {
  COMMENTS,
  GAME_DESCRIPTION,
  GAME_HERO_IMAGE,
  GAME_LIKES,
  GAME_RATING,
  GAME_TITLE,
  INFO_WIDGETS,
  TOP_RECORDS,
} from '../../data/game-detail-dialog';
import type { Comment, InfoWidget, TopRecord } from '../../data/game-detail-dialog';
import { createElement } from '../../utils/helpers';
import { createStatsBadges } from '../library-page/stats-badges';
import { hideDialog, showDialog } from './dialog-backdrop';

// TODO: Change to real author initial
const NEW_COMMENT_AUTHOR_INITIAL = 'U';
const TEXTAREA_MAX_HEIGHT_PX = 76;

export function openGameDetailDialog(): void {
  const panel = createContent(() => {
    hideDialog();
  });

  showDialog(panel, { ariaLabel: GAME_TITLE });
}

function createContent(onClose: () => void): HTMLElement {
  return createElement('div', {
    className: 'game-detail-dialog',
    children: [createHero(), createBody(), createCloseButton(onClose)],
  });
}

function createHero(): HTMLElement {
  return createElement('img', {
    className: 'game-detail-dialog__hero',
    attributes: { src: GAME_HERO_IMAGE, alt: GAME_TITLE },
  });
}

function createCloseButton(onClose: () => void): HTMLButtonElement {
  const button = createElement('button', {
    className: 'game-detail-dialog__close',
    attributes: { type: 'button', 'aria-label': 'Close dialog' },
    children: [createElement('img', { attributes: { src: closeIcon, alt: '' } })],
  });

  button.addEventListener('click', onClose);
  return button;
}

function createBody(): HTMLElement {
  return createElement('div', {
    className: 'game-detail-dialog__body',
    children: [
      createTitleRow(),
      createElement('p', {
        className: 'game-detail-dialog__description',
        textContent: GAME_DESCRIPTION,
      }),
      createInfoWidgets(),
      createActions(),
      createRecordsSection(),
      createCommentsSection(),
    ],
  });
}

function createTitleRow(): HTMLElement {
  return createElement('div', {
    className: 'game-detail-dialog__title-row',
    children: [
      createElement('h2', { className: 'game-detail-dialog__title', textContent: GAME_TITLE }),
      createStatsBadges(GAME_RATING, GAME_LIKES),
    ],
  });
}

function createInfoWidgets(): HTMLElement {
  const widgets = INFO_WIDGETS.map((widget) => createInfoWidget(widget));

  return createElement('div', { className: 'game-detail-dialog__widgets', children: widgets });
}

function createInfoWidget(widget: InfoWidget): HTMLElement {
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

function createActions(): HTMLElement {
  let isFavorite = false;

  const labelSpan = createElement('span', { textContent: 'Add to Favorites' });
  const buttonIcon = createElement('span', { className: 'game-detail-dialog__favorite-icon' });
  const AddToFavoritesButton = createElement('button', {
    className: 'game-detail-dialog__favorite-button',
    attributes: { type: 'button' },
    children: [buttonIcon, labelSpan],
  });

  AddToFavoritesButton.addEventListener('click', () => {
    isFavorite = !isFavorite;
    buttonIcon.classList.toggle('game-detail-dialog__favorite-icon--active', isFavorite);
    labelSpan.textContent = isFavorite ? 'Remove from Favorites' : 'Add to Favorites';
  });

  return createElement('div', {
    className: 'game-detail-dialog__actions',
    children: [
      createElement('button', {
        className: 'game-detail-dialog__play-button',
        textContent: 'Play Now',
        attributes: { type: 'button' },
      }),
      AddToFavoritesButton,
    ],
  });
}

function createRecordsSection(): HTMLElement {
  const records = TOP_RECORDS.map((record) => createRecordRow(record));

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

function createRecordRow(record: TopRecord): HTMLElement {
  return createElement('li', {
    className: 'game-detail-dialog__record',
    children: [
      createElement('span', {
        className: 'game-detail-dialog__record-player',
        children: [
          createElement('span', {
            attributes: { 'aria-hidden': 'true' },
            textContent: record.medal,
          }),
          createElement('span', { textContent: record.username }),
        ],
      }),
      createElement('span', {
        className: 'game-detail-dialog__record-result',
        children: [
          createElement('span', {
            className: 'game-detail-dialog__record-score',
            textContent: record.score,
          }),
          createElement('span', {
            className: 'game-detail-dialog__record-time',
            textContent: record.timeAgo,
          }),
        ],
      }),
    ],
  });
}

function createCommentsSection(): HTMLElement {
  const comments = COMMENTS.map((comment) => createCommentCard(comment));

  return createElement('section', {
    className: 'game-detail-dialog__comments',
    children: [
      createElement('h3', {
        className: 'game-detail-dialog__section-title',
        textContent: `Comments (${COMMENTS.length})`,
      }),
      createNewCommentRow(),
      createElement('ul', { className: 'game-detail-dialog__comment-list', children: comments }),
    ],
  });
}

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

function createCommentHeader(comment: Comment): HTMLElement {
  return createElement('div', {
    className: 'game-detail-dialog__comment-header',
    children: [
      createElement('div', {
        className: 'game-detail-dialog__comment-author',
        children: [
          createElement('span', {
            className: `game-detail-dialog__avatar game-detail-dialog__avatar--${comment.avatarColor}`,
            textContent: comment.initial,
          }),
          createElement('span', {
            className: 'game-detail-dialog__comment-username',
            textContent: comment.username,
          }),
        ],
      }),
      createElement('span', {
        className: 'game-detail-dialog__comment-time',
        textContent: comment.timeAgo,
      }),
    ],
  });
}

function createCommentLikes(comment: Comment): HTMLElement {
  const commentLikeButton = createElement('button', {
    className: `game-detail-dialog__comment-like-button ${comment.isLiked ? 'game-detail-dialog__comment-like-button--active' : ''}`,
    attributes: { type: 'button' },
  });
  const likesCounter = createElement('span', { textContent: String(comment.likesCount) });

  commentLikeButton.addEventListener('click', () => {
    comment.isLiked = !comment.isLiked;
    comment.likesCount += comment.isLiked ? 1 : -1;
    commentLikeButton.classList.toggle('game-detail-dialog__comment-like-button--active');
    likesCounter.textContent = String(comment.likesCount);
  });

  return createElement('div', {
    className: 'game-detail-dialog__comment-likes',
    children: [commentLikeButton, likesCounter],
  });
}

function createCommentCard(comment: Comment): HTMLElement {
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
