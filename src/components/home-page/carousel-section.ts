import starIcon from '../../assets/icons/star.svg';
import favoriteIcon from '../../assets/icons/heart.svg';
import arrowBackIcon from '../../assets/icons/arrow_back.svg';
import arrowForwardIcon from '../../assets/icons/arrow_forward.svg';
import gamesData from '../../data/all-games-seed.json';
import { createElement } from '../../utils/helpers';
import { createSubtitle } from '../subtitle';

type CardVariant = 'main' | 'secondary';

interface Game {
  slug: string;
  name: string;
  category: string;
  price: string;
  shortDescription: string;
  rating: number;
  likesCount: number;
  cardImage: string;
  featured: boolean;
}

const GAMES: Game[] = gamesData.data;

// Number of clone cards to insert on each side to create the illusion of a continuous loop.
// (2 on the left + main + 2 on the right); anything else gets cut off by the viewport edge anyway.
const RING_BUFFER_SIZE = 2;

export function createCarouselSection(): HTMLElement {
  return createElement('section', {
    className: 'carousel',
    children: [createCarouselHeader(), createCarouselSlider()],
  });
}

function createCarouselHeader(): HTMLElement {
  const titleGroup = createSubtitle('New Games');

  const nav = createElement('div', {
    className: 'carousel__nav',
    children: [
      createNavButton(arrowBackIcon, 'Previous games', 'carousel__nav-button--prev'),
      createNavButton(arrowForwardIcon, 'Next games', 'carousel__nav-button--next'),
    ],
  });

  return createElement('div', {
    className: 'carousel__header',
    children: [titleGroup, nav],
  });
}

function createNavButton(icon: string, label: string, className: string): HTMLElement {
  const button = createElement('button', {
    className: `carousel__nav-button ${className}`,
    attributes: {
      type: 'button',
      'aria-label': label,
      disabled: 'true',
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

  return button;
}

function createCarouselSlider(): HTMLElement {
  const bufferedGames = getBufferedGames(GAMES, RING_BUFFER_SIZE);
  const activeIndex = getActiveIndex();

  const cards = bufferedGames.map((game, index) =>
    createGameCard(game, index === activeIndex ? 'main' : 'secondary'),
  );

  const track = createElement('div', {
    className: 'carousel__track',
    children: cards,
  });

  const viewport = createElement('div', {
    className: 'carousel__viewport',
    children: [track],
  });

  scrollToCard(track, activeIndex);

  return viewport;
}

function getActiveIndex(): number {
  //TODO: Here, we will get the active index from the slider.
  return RING_BUFFER_SIZE + 0;
}

function getBufferedGames(games: Game[], bufferSize: number): Game[] {
  const before = games.slice(-bufferSize);
  const after = games.slice(0, bufferSize);
  return [...before, ...games, ...after];
}

function scrollToCard(track: HTMLElement, index: number): void {
  const scroll = (): void => {
    const card = track.children[index] as HTMLElement | undefined;
    if (!card) return;

    card.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'center',
    });
  };

  requestAnimationFrame(scroll);
}

function createGameCard(game: Game, variant: CardVariant): HTMLElement {
  const { name, rating, likesCount, cardImage } = game;

  const imageWrapper = createElement('div', {
    className: 'carousel__card-image-wrapper',
    children: [
      createElement('img', {
        className: 'carousel__card-image',
        attributes: { src: cardImage, alt: name },
      }),
      createCardOverlay(name, rating, likesCount),
    ],
  });

  return createElement('div', {
    className: `carousel__card carousel__card--${variant}`,
    children: [imageWrapper],
  });
}

function createCardOverlay(title: string, rating: number, likesCount: number): HTMLElement {
  const titleElement = createElement('p', {
    className: 'carousel__card-title',
    textContent: title,
  });

  const meta = createElement('div', {
    className: 'carousel__card-meta',
    children: [
      createMetaItem(starIcon, rating.toFixed(1), 'carousel__card-rating'),
      createMetaItem(favoriteIcon, formatLikesCount(likesCount), 'carousel__card-likes'),
    ],
  });

  return createElement('div', {
    className: 'carousel__card-overlay',
    children: [titleElement, meta],
  });
}

function createMetaItem(icon: string, value: string, className: string): HTMLElement {
  return createElement('div', {
    className: `carousel__card-meta-item ${className}`,
    children: [
      createElement('img', {
        className: 'carousel__card-meta-icon',
        attributes: { src: icon, alt: '' },
      }),
      createElement('span', { className: 'carousel__card-meta-text', textContent: value }),
    ],
  });
}

function formatLikesCount(likesCount: number): string {
  if (likesCount >= 1000) {
    return `${(likesCount / 1000).toFixed(1)}K`;
  }

  return String(likesCount);
}
