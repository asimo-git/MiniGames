import starIcon from '../../assets/icons/star.svg';
import favoriteIcon from '../../assets/icons/heart.svg';
import { createElement, formatCount } from '../../utils/helpers';
import type { Game } from '../../utils/types';

export type CardVariant = 'main' | 'secondary';

export interface CardReferences {
  root: HTMLElement;
  image: HTMLImageElement;
  title: HTMLElement;
  ratingText: HTMLElement;
  likesText: HTMLElement;
}

export function createGameCard(game: Game, variant: CardVariant): CardReferences {
  const image = createElement('img', {
    className: 'carousel__card-image',
    attributes: {
      src: game.cardImage,
      alt: game.name,
    },
  });

  const title = createElement('p', {
    className: 'carousel__card-title',
    textContent: game.name,
  });

  const ratingItem = createMetaItem(starIcon, game.rating.toFixed(1), 'carousel__card-rating');
  const likesItem = createMetaItem(
    favoriteIcon,
    formatCount(game.likesCount),
    'carousel__card-likes',
  );

  const meta = createElement('div', {
    className: 'carousel__card-meta',
    children: [ratingItem.root, likesItem.root],
  });

  const overlay = createElement('div', {
    className: 'carousel__card-overlay',
    children: [title, meta],
  });

  const imageWrapper = createElement('div', {
    className: 'carousel__card-image-wrapper',
    children: [image, overlay],
  });

  const root = createElement('div', {
    className: `carousel__card carousel__card--${variant}`,
    children: [imageWrapper],
  });

  return {
    root,
    image,
    title,
    ratingText: ratingItem.text,
    likesText: likesItem.text,
  };
}

export function updateGameCard(card: CardReferences, game: Game, variant: CardVariant): void {
  card.image.src = game.cardImage;
  card.image.alt = game.name;
  card.title.textContent = game.name;
  card.ratingText.textContent = game.rating.toFixed(1);
  card.likesText.textContent = formatCount(game.likesCount);

  setCardVariant(card, variant);
}

export function setCardVariant(card: CardReferences, variant: CardVariant): void {
  card.root.classList.remove('carousel__card--main', 'carousel__card--secondary');
  card.root.classList.add(`carousel__card--${variant}`);
}

function createMetaItem(
  icon: string,
  value: string,
  className: string,
): { root: HTMLElement; text: HTMLElement } {
  const text = createElement('span', {
    className: 'carousel__card-meta-text',
    textContent: value,
  });

  const root = createElement('div', {
    className: `carousel__card-meta-item ${className}`,
    children: [
      createElement('img', {
        className: 'carousel__card-meta-icon',
        attributes: {
          src: icon,
          alt: '',
        },
      }),
      text,
    ],
  });

  return { root, text };
}
