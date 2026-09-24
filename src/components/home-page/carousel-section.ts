import starIcon from '../../assets/icons/star.svg';
import favoriteIcon from '../../assets/icons/heart.svg';
import arrowBackIcon from '../../assets/icons/arrow_back.svg';
import arrowForwardIcon from '../../assets/icons/arrow_forward.svg';
import gamesData from '../../data/all-games-seed.json';
import { createElement, formatCount } from '../../utils/helpers';
import { createSubtitle } from '../subtitle';
import type { Game } from '../../utils/types';

type CardVariant = 'main' | 'secondary';
type Direction = -1 | 1;

const GAMES: Game[] = gamesData.data;

const RING_BUFFER_SIZE = 3;
const FALLBACK_TIMEOUT_MS = 700;
const AUTOPLAY_INTERVAL_MS = 4000;
const SWIPE_THRESHOLD_PX = 40;

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

  const { viewport, track, cards } = createCarouselSlider(featuredGames, state.centerRealIndex);

  const go = (direction: Direction): void => {
    goToSlide(viewport, track, cards, featuredGames, state, direction);
  };

  const autoplay = createAutoplay(() => go(1));

  const navigate = (direction: Direction): void => {
    go(direction);
    autoplay.reset();
  };

  enableSwipe(viewport, navigate);

  const header = createCarouselHeader(
    () => navigate(-1),
    () => navigate(1),
  );

  const section = createElement('section', {
    className: 'carousel',
    children: [header, viewport],
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

  track.style.setProperty('--ring', String(RING_BUFFER_SIZE));
  track.style.setProperty('--shift', '0');

  const viewport = createElement('div', {
    className: 'carousel__viewport',
    children: [track],
  });

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
  direction: Direction,
): void {
  if (state.isAnimating) return;

  const centerPosition = RING_BUFFER_SIZE;
  const targetPosition = centerPosition + direction;

  if (targetPosition < 0 || targetPosition >= cards.length) return;

  state.isAnimating = true;

  cards[centerPosition]!.root.classList.remove('carousel__card--main');
  cards[centerPosition]!.root.classList.add('carousel__card--secondary');
  cards[targetPosition]!.root.classList.remove('carousel__card--secondary');
  cards[targetPosition]!.root.classList.add('carousel__card--main');

  track.getBoundingClientRect();
  track.style.setProperty('--shift', String(direction));

  onTransitionEnd(track, () => {
    state.centerRealIndex = getPositiveModule(
      state.centerRealIndex + direction,
      featuredGames.length,
    );

    withoutTransitions(viewport, () => {
      rotateCards(track, cards, featuredGames, state.centerRealIndex, direction);
      track.style.setProperty('--shift', '0');
    });

    state.isAnimating = false;
  });
}

function rotateCards(
  track: HTMLElement,
  cards: CardReferences[],
  featuredGames: Game[],
  centerRealIndex: number,
  direction: Direction,
): void {
  let moved: CardReferences;
  let realIndex: number;

  if (direction > 0) {
    moved = cards.shift()!;
    cards.push(moved);
    track.append(moved.root);
    realIndex = getPositiveModule(centerRealIndex + RING_BUFFER_SIZE, featuredGames.length);
  } else {
    moved = cards.pop()!;
    cards.unshift(moved);
    track.prepend(moved.root);
    realIndex = getPositiveModule(centerRealIndex - RING_BUFFER_SIZE, featuredGames.length);
  }

  updateGameCard(moved, featuredGames[realIndex]!, 'secondary');
}

function withoutTransitions(viewport: HTMLElement, action: () => void): void {
  viewport.classList.add('carousel__viewport--static');
  action();
  viewport.getBoundingClientRect();
  viewport.classList.remove('carousel__viewport--static');
}

function onTransitionEnd(track: HTMLElement, callback: () => void): void {
  let isSettled = false;

  function handleTransitionEnd(event: TransitionEvent): void {
    if (event.target === track && event.propertyName === 'transform') finish();
  }

  function finish(): void {
    if (isSettled) return;
    isSettled = true;
    track.removeEventListener('transitionend', handleTransitionEnd);
    clearTimeout(timeoutId);
    callback();
  }

  const timeoutId: ReturnType<typeof setTimeout> = globalThis.setTimeout(
    finish,
    FALLBACK_TIMEOUT_MS,
  );

  track.addEventListener('transitionend', handleTransitionEnd);
}

function createGameCard(game: Game, variant: CardVariant): CardReferences {
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

function enableSwipe(viewport: HTMLElement, onSwipe: (direction: Direction) => void): void {
  let startX = 0;
  let startY = 0;
  let isTracking = false;

  viewport.addEventListener('pointerdown', (event) => {
    if (event.pointerType === 'mouse') return;

    isTracking = true;
    startX = event.clientX;
    startY = event.clientY;
  });

  viewport.addEventListener('pointerup', (event) => {
    if (!isTracking) return;
    isTracking = false;

    const deltaX = event.clientX - startX;
    const deltaY = event.clientY - startY;

    if (Math.abs(deltaX) < SWIPE_THRESHOLD_PX || Math.abs(deltaX) < Math.abs(deltaY)) return;

    onSwipe(deltaX < 0 ? 1 : -1);
  });

  viewport.addEventListener('pointercancel', () => {
    isTracking = false;
  });
}

type PauseReason = 'focus' | 'press' | 'offscreen' | 'hidden';

function createAutoplay(onTick: () => void): {
  reset: () => void;
  attach: (target: HTMLElement) => void;
} {
  if (globalThis.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return { reset: () => {}, attach: () => {} };
  }

  const paused: Record<PauseReason, boolean> = {
    focus: false,
    press: false,
    offscreen: true,
    hidden: document.hidden,
  };

  let remainingMs = AUTOPLAY_INTERVAL_MS;
  let startedAt = 0;
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  const isPaused = (): boolean => Object.values(paused).some(Boolean);

  const schedule = (): void => {
    if (timeoutId !== undefined || isPaused()) return;

    startedAt = performance.now();
    timeoutId = globalThis.setTimeout(() => {
      timeoutId = undefined;
      remainingMs = AUTOPLAY_INTERVAL_MS;
      onTick();
      schedule();
    }, remainingMs);
  };

  const freeze = (): void => {
    if (timeoutId === undefined) return;

    clearTimeout(timeoutId);
    timeoutId = undefined;
    remainingMs = Math.max(0, remainingMs - (performance.now() - startedAt));
  };

  const reset = (): void => {
    clearTimeout(timeoutId);
    timeoutId = undefined;
    remainingMs = AUTOPLAY_INTERVAL_MS;
    schedule();
  };

  const setPaused = (reason: PauseReason, isActive: boolean): void => {
    paused[reason] = isActive;

    if (isPaused()) {
      freeze();
    } else {
      schedule();
    }
  };

  const attach = (target: HTMLElement): void => {
    const activePointers = new Set<number>();

    target.addEventListener('pointerdown', (event) => {
      activePointers.add(event.pointerId);
      setPaused('press', true);
    });

    const release = (event: PointerEvent): void => {
      activePointers.delete(event.pointerId);
      if (activePointers.size === 0) setPaused('press', false);
    };

    document.addEventListener('pointerup', release);
    document.addEventListener('pointercancel', release);

    target.addEventListener('focusin', (event) => {
      setPaused('focus', (event.target as HTMLElement).matches(':focus-visible'));
    });

    target.addEventListener('focusout', () => {
      setPaused('focus', false);
    });

    new IntersectionObserver(([entry]) => {
      setPaused('offscreen', !entry?.isIntersecting);
    }).observe(target);

    document.addEventListener('visibilitychange', () => {
      setPaused('hidden', document.hidden);
    });
  };

  return { reset, attach };
}
