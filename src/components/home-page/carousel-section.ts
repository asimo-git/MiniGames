import arrowBackIcon from '../../assets/icons/arrow_back.svg';
import arrowForwardIcon from '../../assets/icons/arrow_forward.svg';
import { createElement } from '../../utils/helpers';

import { createSubtitle } from '../subtitle';
import { enableSwipe } from '../../utils/enable-swipe';
import { createAutoplay } from '../../utils/autoplay';
import { createCarouselSlider, type Direction } from './carousel-slider';
import { api } from '../../api/endpoints';
import { mountAsyncSection } from '../../utils/mount-sync-section';
import { createSkeleton } from '../skeleton';
import { createEmptyState } from '../empty-state';

export function createCarouselSection(): HTMLElement {
  // let navigate: (direction: Direction) => void = () => {};

  const header = createElement('div', {
    className: 'carousel__header',
    children: [createSubtitle('New Games')],
  });

  const viewport = createElement('div', { className: 'carousel__viewport' });

  const section = createElement('section', {
    className: 'carousel',
    children: [header, viewport],
  });

  void mountAsyncSection(viewport, {
    // load: () => new Promise(() => {}),
    // load: () => Promise.reject(new Error('Error')),
    // load: () => Promise.resolve([]),
    load: () => api.getFeaturedGames(),
    skeleton: () => [createSkeleton({ width: '100%' })],
    render: (games) => {
      if (games.length === 0) {
        return [createEmptyState('No new games found')];
      }

      const slider = createCarouselSlider(games, viewport);
      const autoplay = createAutoplay(() => slider.moveSlide(1));

      const navigate = (direction: Direction) => {
        slider.moveSlide(direction);
        autoplay.reset();
      };

      const nav = createElement('div', {
        className: 'carousel__nav',
        attributes: { hidden: '' },
        children: [
          createNavButton(arrowBackIcon, 'Previous games', 'carousel__nav-button--prev', () =>
            navigate(-1),
          ),
          createNavButton(arrowForwardIcon, 'Next games', 'carousel__nav-button--next', () =>
            navigate(1),
          ),
        ],
      });
      header.append(nav);

      enableSwipe(viewport, (swipe) => navigate(swipe));
      autoplay.attach(section);
      nav.hidden = false;

      return [slider.element];
    },
  });

  return section;
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
