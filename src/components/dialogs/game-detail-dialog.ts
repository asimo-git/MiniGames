import closeIcon from '../../assets/icons/close.svg';
import favoriteIcon from '../../assets/icons/heart.svg';
import sendIcon from '../../assets/icons/send.svg';
import starIcon from '../../assets/icons/star.svg';

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
import { hideDialog, showDialog } from './dialog-backdrop';

const NEW_COMMENT_AUTHOR_INITIAL = 'U';
const COMMENT_PLACEHOLDER = 'Write a comment...';

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
  return createElement('div', {
    className: 'game-detail-dialog__hero',
    attributes: { style: `background-image: url(${GAME_HERO_IMAGE})` },
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
      createRatings(),
    ],
  });
}

function createRatings(): HTMLElement {
  return createElement('div', {
    className: 'game-detail-dialog__ratings',
    children: [
      createElement('span', {
        className: 'game-detail-dialog__rating-item',
        children: [
          createElement('img', { attributes: { src: starIcon, alt: '' } }),
          createElement('span', { textContent: GAME_RATING }),
        ],
      }),
      createElement('span', {
        className: 'game-detail-dialog__rating-item',
        children: [
          createElement('img', { attributes: { src: favoriteIcon, alt: '' } }),
          createElement('span', { textContent: GAME_LIKES }),
        ],
      }),
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
  return createElement('div', {
    className: 'game-detail-dialog__actions',
    children: [
      createElement('button', {
        className: 'game-detail-dialog__play-button',
        textContent: 'Play Now',
        attributes: { type: 'button' },
      }),
      createElement('button', {
        className: 'game-detail-dialog__favorite-button',
        attributes: { type: 'button' },
        children: [
          createElement('img', { attributes: { src: favoriteIcon, alt: '' } }),
          createElement('span', { textContent: 'Add to Favorites' }),
        ],
      }),
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
  return createElement('div', {
    className: 'game-detail-dialog__new-comment',
    children: [
      createElement('span', {
        className: 'game-detail-dialog__avatar',
        textContent: NEW_COMMENT_AUTHOR_INITIAL,
      }),
      createElement('input', {
        className: 'game-detail-dialog__comment-input',
        attributes: { type: 'text', placeholder: COMMENT_PLACEHOLDER },
      }),
      createElement('button', {
        className: 'game-detail-dialog__send-button',
        attributes: { type: 'button', 'aria-label': 'Send comment' },
        children: [createElement('img', { attributes: { src: sendIcon, alt: '' } })],
      }),
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
  const iconUrl = comment.isLiked ? favoriteIcon : favoriteIcon;

  return createElement('span', {
    className: 'game-detail-dialog__comment-likes',
    children: [
      createElement('img', { attributes: { src: iconUrl, alt: '' } }),
      createElement('span', { textContent: String(comment.likesCount) }),
    ],
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
