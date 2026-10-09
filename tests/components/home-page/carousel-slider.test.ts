import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  createGameCard: vi.fn(),
  setCardVariant: vi.fn(),
  updateGameCard: vi.fn(),
}));

vi.mock('../../../src/components/home-page/carousel-card', () => mocks);

import type { GameSummary } from '../../../src/api/types';
import {
  createCarouselSlider,
  onTransitionEnd,
} from '../../../src/components/home-page/carousel-slider';

type CardStub = { root: HTMLElement };

const games = ['a', 'b', 'c', 'd'].map((slug) => ({ slug }) as GameSummary);

const createdCards = (): CardStub[] =>
  mocks.createGameCard.mock.results.map((result) => result.value as CardStub);

const slugs = (track: HTMLElement): (string | undefined)[] =>
  [...track.children].map((child) => (child as HTMLElement).dataset.slug);

function fireTransitionEnd(target: HTMLElement, propertyName: string): void {
  const event = new Event('transitionend', { bubbles: true });
  Object.defineProperty(event, 'propertyName', { value: propertyName });
  target.dispatchEvent(event);
}

describe('createCarouselSlider', () => {
  let viewport: HTMLElement;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    viewport = document.createElement('div');
    mocks.createGameCard.mockImplementation((game: { slug: string }) => {
      const root = document.createElement('div');
      root.dataset.slug = game.slug;
      return { root };
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('builds a ring of 7 cards around the first game with the center as main', () => {
    const { element: track } = createCarouselSlider(games, viewport);

    expect(slugs(track)).toEqual(['b', 'c', 'd', 'a', 'b', 'c', 'd']);
    expect(mocks.createGameCard.mock.calls.map((call) => call[1])).toEqual([
      'secondary',
      'secondary',
      'secondary',
      'main',
      'secondary',
      'secondary',
      'secondary',
    ]);
    expect(track.className).toBe('carousel__track');
    expect(track.style.getPropertyValue('--ring')).toBe('3');
    expect(track.style.getPropertyValue('--shift')).toBe('0');
  });

  it('moves forward: shifts, rotates the first card to the end after the timeout', () => {
    const { element: track, moveSlide } = createCarouselSlider(games, viewport);
    const cards = createdCards();
    let isStaticDuringRotation = false;
    mocks.updateGameCard.mockImplementation(() => {
      isStaticDuringRotation = viewport.classList.contains('carousel__viewport--static');
    });

    moveSlide(1);

    expect(mocks.setCardVariant).toHaveBeenNthCalledWith(1, cards[3], 'secondary');
    expect(mocks.setCardVariant).toHaveBeenNthCalledWith(2, cards[4], 'main');
    expect(track.style.getPropertyValue('--shift')).toBe('1');

    moveSlide(1);
    expect(mocks.setCardVariant).toHaveBeenCalledTimes(2);

    vi.advanceTimersByTime(700);

    expect([...track.children]).toEqual([...cards.slice(1), cards[0]].map((card) => card.root));
    expect(mocks.updateGameCard).toHaveBeenCalledExactlyOnceWith(cards[0], games[0], 'secondary');
    expect(isStaticDuringRotation).toBe(true);
    expect(viewport.classList.contains('carousel__viewport--static')).toBe(false);
    expect(track.style.getPropertyValue('--shift')).toBe('0');

    moveSlide(1);
    expect(mocks.setCardVariant).toHaveBeenCalledTimes(4);
  });

  it('moves backward: rotates the last card to the start on transitionend', () => {
    const { element: track, moveSlide } = createCarouselSlider(games, viewport);
    const cards = createdCards();

    moveSlide(-1);

    expect(mocks.setCardVariant).toHaveBeenNthCalledWith(2, cards[2], 'main');
    expect(track.style.getPropertyValue('--shift')).toBe('-1');

    fireTransitionEnd(track, 'transform');

    expect([...track.children]).toEqual([cards[6], ...cards.slice(0, 6)].map((card) => card.root));
    expect(mocks.updateGameCard).toHaveBeenCalledExactlyOnceWith(cards[6], games[0], 'secondary');
    expect(track.style.getPropertyValue('--shift')).toBe('0');
  });
});

describe('onTransitionEnd', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('calls back once on the matching transitionend and cancels the fallback', () => {
    const element = document.createElement('div');
    const child = document.createElement('span');
    element.append(child);
    const callback = vi.fn();

    onTransitionEnd(element, 'transform', 700, callback);

    fireTransitionEnd(child, 'transform');
    fireTransitionEnd(element, 'opacity');
    expect(callback).not.toHaveBeenCalled();

    fireTransitionEnd(element, 'transform');
    fireTransitionEnd(element, 'transform');
    vi.advanceTimersByTime(700);

    expect(callback).toHaveBeenCalledOnce();
  });

  it('falls back to the timeout and then ignores late transitionend events', () => {
    const element = document.createElement('div');
    const callback = vi.fn();

    onTransitionEnd(element, 'transform', 700, callback);
    vi.advanceTimersByTime(700);
    fireTransitionEnd(element, 'transform');

    expect(callback).toHaveBeenCalledOnce();
  });
});
