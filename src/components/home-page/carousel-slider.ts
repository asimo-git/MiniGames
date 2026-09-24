import { createElement } from '../../utils/helpers';
import { getPositiveModule } from '../../utils/helpers';
import {
  createGameCard,
  setCardVariant,
  updateGameCard,
  type CardReferences,
  type CardVariant,
} from './carousel-card';
import type { Game } from '../../utils/types';

export type Direction = -1 | 1;

export interface CarouselSlider {
  element: HTMLElement;
  moveSlide: (direction: Direction) => void;
}

const RING_BUFFER_SIZE = 3;
const CENTER_POSITION = RING_BUFFER_SIZE;
const FALLBACK_TIMEOUT_MS = 700;

export function createCarouselSlider(games: Game[]): CarouselSlider {
  let centerRealIndex = 0;
  let isAnimating = false;

  const cards = createCards(games, centerRealIndex);

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

  const moveSlide = (direction: Direction): void => {
    if (isAnimating) return;

    const targetPosition = CENTER_POSITION + direction;

    isAnimating = true;

    setCardVariant(cards[CENTER_POSITION]!, 'secondary');
    setCardVariant(cards[targetPosition]!, 'main');

    track.getBoundingClientRect();
    track.style.setProperty('--shift', String(direction));

    onTransitionEnd(track, 'transform', FALLBACK_TIMEOUT_MS, () => {
      centerRealIndex = getPositiveModule(centerRealIndex + direction, games.length);

      performWithoutTransitions(viewport, () => {
        rotateCards(track, cards, games, centerRealIndex, direction);
        track.style.setProperty('--shift', '0');
      });

      isAnimating = false;
    });
  };

  return { element: viewport, moveSlide };
}

function createCards(games: Game[], centerRealIndex: number): CardReferences[] {
  const windowSize = RING_BUFFER_SIZE * 2 + 1;
  const cards: CardReferences[] = [];

  for (let position = 0; position < windowSize; position += 1) {
    const realIndex = getPositiveModule(
      centerRealIndex - RING_BUFFER_SIZE + position,
      games.length,
    );
    const variant: CardVariant = position === CENTER_POSITION ? 'main' : 'secondary';
    cards.push(createGameCard(games[realIndex]!, variant));
  }

  return cards;
}

function rotateCards(
  track: HTMLElement,
  cards: CardReferences[],
  games: Game[],
  centerRealIndex: number,
  direction: Direction,
): void {
  let moved: CardReferences;
  let realIndex: number;

  if (direction > 0) {
    moved = cards.shift()!;
    cards.push(moved);
    track.append(moved.root);
    realIndex = getPositiveModule(centerRealIndex + RING_BUFFER_SIZE, games.length);
  } else {
    moved = cards.pop()!;
    cards.unshift(moved);
    track.prepend(moved.root);
    realIndex = getPositiveModule(centerRealIndex - RING_BUFFER_SIZE, games.length);
  }

  updateGameCard(moved, games[realIndex]!, 'secondary');
}

function performWithoutTransitions(viewport: HTMLElement, action: () => void): void {
  viewport.classList.add('carousel__viewport--static');
  action();
  viewport.getBoundingClientRect();
  viewport.classList.remove('carousel__viewport--static');
}

export function onTransitionEnd(
  element: HTMLElement,
  propertyName: string,
  fallbackMs: number,
  callback: () => void,
): void {
  let isSettled = false;

  const handleTransitionEnd = (event: TransitionEvent): void => {
    if (event.target === element && event.propertyName === propertyName) finish();
  };

  function finish(): void {
    if (isSettled) return;
    isSettled = true;
    element.removeEventListener('transitionend', handleTransitionEnd);
    clearTimeout(timeoutId);
    callback();
  }

  element.addEventListener('transitionend', handleTransitionEnd);
  const timeoutId: ReturnType<typeof setTimeout> = globalThis.setTimeout(finish, fallbackMs);
}
