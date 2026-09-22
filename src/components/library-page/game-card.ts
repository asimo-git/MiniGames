import { createElement, formatCount } from '../../utils/helpers';
import type { Game } from '../../utils/types';
import starIcon from '../../assets/icons/star.svg';
import favoriteIcon from '../../assets/icons/heart.svg';

const FREE_PRICE_LABEL = 'free';

export function createGameCard(game: Game): HTMLElement {
  return createElement('li', {
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

function createStats(game: Game): HTMLElement {
  const createStat = (iconName: string, value: string): HTMLElement => {
    return createElement('div', {
      className: 'game-card__stat',
      children: [
        createElement('img', {
          className: 'game-card__icon',
          attributes: { src: iconName, alt: '' },
        }),
        createElement('span', { textContent: value }),
      ],
    });
  };

  const rating = createStat(starIcon, game.rating.toFixed(1));
  const likes = createStat(favoriteIcon, formatCount(game.likesCount));

  return createElement('div', { className: 'game-card__stats', children: [rating, likes] });
}

function createFooter(game: Game): HTMLElement {
  return createElement('div', {
    className: 'game-card__footer',
    children: [
      createStats(game),
      createElement('a', {
        className: 'game-card__button',
        textContent: 'Details',
        attributes: { href: `/games/${game.slug}`, 'aria-label': `Details of ${game.name}` },
      }),
    ],
  });
}
