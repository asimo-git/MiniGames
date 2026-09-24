import starIcon from '../../assets/icons/star.svg';
import favoriteIcon from '../../assets/icons/heart.svg';
import arrowBackIcon from '../../assets/icons/arrow_back.svg';
import arrowForwardIcon from '../../assets/icons/arrow_forward.svg';
import gamesData from '../../data/all-games-seed.json';
import { createElement, formatCount } from '../../utils/helpers';
import { createSubtitle } from '../subtitle';
import type { Game } from '../../utils/types';

type CardVariant = 'main' | 'secondary';

const GAMES: Game[] = gamesData.data;

const RING_BUFFER_SIZE = 2;

interface CardReferences {
  root: HTMLElement;
  image: HTMLImageElement;
  title: HTMLElement;
  ratingText: HTMLElement;
  likesText: HTMLElement;
}

interface CarouselState {
  centerRealIndex: number;
  isAnimating: boolean;
}

export function createCarouselSection(): HTMLElement {
  const featuredGames = GAMES.filter((game) => game.featured);
  const state: CarouselState = { centerRealIndex: 0, isAnimating: false };

  const slider = createCarouselSlider(featuredGames, state.centerRealIndex);
  const { viewport, track, cards } = slider;

  const movePrevious = (): void => {
    goToSlide(viewport, track, cards, featuredGames, state, -1);
  };

  const moveNext = (): void => {
    goToSlide(viewport, track, cards, featuredGames, state, 1);
  };

  const header = createCarouselHeader(movePrevious, moveNext);

  return createElement('section', {
    className: 'carousel',
    children: [header, viewport],
  });
}

function createCarouselHeader(onPrevious: () => void, onNext: () => void): HTMLElement {
  const titleGroup = createSubtitle('New Games');

  const nav = createElement('div', {
    className: 'carousel__nav',
    children: [
      createNavButton(arrowBackIcon, 'Previous games', 'carousel__nav-button--prev', onPrevious),
      createNavButton(arrowForwardIcon, 'Next games', 'carousel__nav-button--next', onNext),
    ],
  });

  return createElement('div', {
    className: 'carousel__header',
    children: [titleGroup, nav],
  });
}

function createNavButton(
  icon: string,
  label: string,
  className: string,
  onClick: () => void,
): HTMLElement {
  const button = createElement('button', {
    className: `carousel__nav-button ${className}`,
    attributes: {
      type: 'button',
      'aria-label': label,
    },
  });

  const image = createElement('img', {
    className: 'carousel__nav-icon',
    attributes: {
      src: icon,
      alt: '',
    },
  });

  button.append(image);
  button.addEventListener('click', onClick);

  return button;
}

function createCarouselSlider(
  featuredGames: Game[],
  centerRealIndex: number,
): {
  viewport: HTMLElement;
  track: HTMLElement;
  cards: CardReferences[];
} {
  const windowSize = RING_BUFFER_SIZE * 2 + 1;
  const cards: CardReferences[] = [];

  for (let position = 0; position < windowSize; position += 1) {
    const realIndex = getPositiveModule(
      centerRealIndex - RING_BUFFER_SIZE + position,
      featuredGames.length,
    );
    const variant: CardVariant = position === RING_BUFFER_SIZE ? 'main' : 'secondary';
    cards.push(createGameCard(featuredGames[realIndex]!, variant));
  }

  const track = createElement('div', {
    className: 'carousel__track',
    children: cards.map((card) => card.root),
  });

  const viewport = createElement('div', {
    className: 'carousel__viewport',
    children: [track],
  });

  scrollToCard(track, RING_BUFFER_SIZE, false);

  return { viewport, track, cards };
}

function getPositiveModule(n: number, m: number): number {
  return ((n % m) + m) % m;
}

function goToSlide(
  viewport: HTMLElement,
  track: HTMLElement,
  cards: CardReferences[],
  featuredGames: Game[],
  state: CarouselState,
  direction: number,
): void {
  if (state.isAnimating) return;

  const windowSize = cards.length;
  const centerPosition = RING_BUFFER_SIZE;
  const targetPosition = centerPosition + direction;

  if (targetPosition < 0 || targetPosition >= windowSize) return;

  state.isAnimating = true;

  cards[centerPosition]!.root.classList.remove('carousel__card--main');
  cards[centerPosition]!.root.classList.add('carousel__card--secondary');
  cards[targetPosition]!.root.classList.remove('carousel__card--secondary');
  cards[targetPosition]!.root.classList.add('carousel__card--main');

  scrollToCard(track, targetPosition, true);

  onScrollEnd(viewport, () => {
    state.centerRealIndex = getPositiveModule(
      state.centerRealIndex + direction,
      featuredGames.length,
    );

    for (let position = 0; position < windowSize; position += 1) {
      const realIndex = getPositiveModule(
        state.centerRealIndex - RING_BUFFER_SIZE + position,
        featuredGames.length,
      );
      const variant: CardVariant = position === centerPosition ? 'main' : 'secondary';
      updateGameCard(cards[position]!, featuredGames[realIndex]!, variant);
    }

    scrollToCard(track, centerPosition, false);

    state.isAnimating = false;
  });
}

function scrollToCard(track: HTMLElement, index: number, isSmooth: boolean): void {
  const scroll = (): void => {
    const card = track.children[index] as HTMLElement | undefined;

    if (!card) return;

    card.scrollIntoView({
      behavior: isSmooth ? 'smooth' : 'auto',
      block: 'nearest',
      inline: 'center',
    });
  };

  requestAnimationFrame(scroll);
}

function onScrollEnd(viewport: HTMLElement, callback: () => void): void {
  let isSettled = false;

  const finish = (): void => {
    if (isSettled) return;
    isSettled = true;
    viewport.removeEventListener('scrollend', finish);
    callback();
  };

  if ('onscrollend' in window) {
    viewport.addEventListener('scrollend', finish, { once: true });
  }

  globalThis.setTimeout(finish, 450);
}

function createGameCard(game: Game, variant: CardVariant): CardReferences {
  const image = createElement('img', {
    className: 'carousel__card-image',
    attributes: {
      src: game.cardImage,
      alt: game.name,
    },
  }) as HTMLImageElement;

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

function updateGameCard(card: CardReferences, game: Game, variant: CardVariant): void {
  card.image.src = game.cardImage;
  card.image.alt = game.name;
  card.title.textContent = game.name;
  card.ratingText.textContent = game.rating.toFixed(1);
  card.likesText.textContent = formatCount(game.likesCount);

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
