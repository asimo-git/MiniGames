import type { GameSummary } from '../../api/types';
import { FREE_PRICE_LABEL } from '../../api/types';
import { openDialog } from '../../router/dialog-router';
import { createElement } from '../../utils/helpers';
import { createStatsBadges } from './stats-badges';

export function createGameCard(game: GameSummary): HTMLElement {
  const card = createElement('li', {
    className: `game-card game-card-geometry`,
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

function createMedia(game: GameSummary): HTMLElement {
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

function createHeader(game: GameSummary): HTMLElement {
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

function createFooter(game: GameSummary): HTMLElement {
  const detailsButton = createElement('button', {
    className: 'game-card__button',
    textContent: 'Details',
    attributes: { type: 'button', 'aria-label': `Details of ${game.name}` },
  });

  detailsButton.addEventListener('click', () => {
    openDialog({ game: game.slug });
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
