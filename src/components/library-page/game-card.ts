import { createElement } from '../../utils/helpers';
import type { Game } from '../../utils/types';
import { openGameDetailDialog } from '../dialogs/game-detail-dialog';
import { createStatsBadges } from './stats-badges';

const FREE_PRICE_LABEL = 'free';

export function createGameCard(game: Game): HTMLElement {
  const card = createElement('li', {
    className: `game-card`,
    children: [
      createMedia(game),
      createElement('div', {
        className: 'game-card__content',
        children: [
          createHeader(game),
          createElement('p', {
            className: 'game-card__description',
            textContent: game.shortDescription,
          }),
          createFooter(game),
        ],
      }),
    ],
  });

  return card;
}

function createMedia(game: Game): HTMLElement {
  return createElement('div', {
    className: 'game-card__media',
    children: [
      createElement('img', {
        className: 'game-card__image',
        attributes: { src: game.cardImage, alt: game.name, loading: 'lazy' },
      }),
    ],
  });
}

function createHeader(game: Game): HTMLElement {
  const isFree = game.price.toLowerCase() === FREE_PRICE_LABEL;

  return createElement('div', {
    className: 'game-card__header',
    children: [
      createElement('div', {
        className: 'game-card__heading',
        children: [
          createElement('h2', { className: 'game-card__title', textContent: game.name }),
          createElement('span', { className: 'game-card__badge', textContent: game.category }),
        ],
      }),
      createElement('span', {
        className: isFree ? 'game-card__price game-card__price--free' : 'game-card__price',
        textContent: game.price,
      }),
    ],
  });
}

function createFooter(game: Game): HTMLElement {
  const detailsButton = createElement('button', {
    className: 'game-card__button',
    textContent: 'Details',
    attributes: { type: 'button', 'aria-label': `Details of ${game.name}` },
  });

  detailsButton.addEventListener('click', () => {
    openGameDetailDialog();
  });

  return createElement('div', {
    className: 'game-card__footer',
    children: [
      createStatsBadges(game.rating, game.likesCount),
      // createElement('a', {
      //   className: 'game-card__button',
      //   textContent: 'Details',
      //   attributes: { href: `/games/${game.slug}`, 'aria-label': `Details of ${game.name}` },
      // }),
      detailsButton,
    ],
  });
}
