import arrowBackIcon from '../../assets/icons/arrow_back.svg';
import arrowForwardIcon from '../../assets/icons/arrow_forward.svg';
import gamesData from '../../data/all-games-seed.json';
import { createElement } from '../../utils/helpers';
import { createSubtitle } from '../subtitle';
import type { Game } from '../../utils/types';
import { enableSwipe } from '../../utils/enable-swipe';
import { createAutoplay } from '../../utils/autoplay';
import { createCarouselSlider, type Direction } from './carousel-slider';

const GAMES: Game[] = gamesData.data;

export function createCarouselSection(): HTMLElement {
  const featuredGames = GAMES.filter((game) => game.featured);
  const slider = createCarouselSlider(featuredGames);

  const autoplay = createAutoplay(() => slider.moveSlide(1));

  const navigate = (direction: Direction): void => {
    slider.moveSlide(direction);
    autoplay.reset();
  };

  enableSwipe(slider.element, (swipe) => navigate(swipe));

  const header = createCarouselHeader(
    () => navigate(-1),
    () => navigate(1),
  );

  const section = createElement('section', {
    className: 'carousel',
    children: [header, slider.element],
  });

  autoplay.attach(section);

  return section;
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
