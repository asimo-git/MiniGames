import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  openDialog: vi.fn(),
  createStatsBadges: vi.fn(() => {
    const element = document.createElement('div');
    element.className = 'stats-stub';
    return element;
  }),
  createImageWithFallback: vi.fn(() => document.createElement('img')),
}));

vi.mock('../../../src/router/dialog-router', () => ({ openDialog: mocks.openDialog }));
vi.mock('../../../src/components/library-page/stats-badges', () => ({
  createStatsBadges: mocks.createStatsBadges,
}));

vi.mock('../../../src/utils/helpers', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../../src/utils/helpers')>()),
  createImageWithFallback: mocks.createImageWithFallback,
}));

import { FREE_PRICE_LABEL, type GameSummary } from '../../../src/api/types';
import { createGameCard } from '../../../src/components/library-page/game-card';

const game = {
  slug: 'testgame',
  name: 'testgame',
  category: 'Puzzle',
  price: '$1.00',
  shortDescription: 'Stack the blocks',
  cardImage: 'testgame.png',
  rating: 4.5,
  likesCount: 100,
} as GameSummary;

describe('createGameCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the image, texts, stats and a details button that opens the game dialog', () => {
    const card = createGameCard(game);

    expect(card.tagName).toBe('LI');
    expect(card.className).toBe('game-card game-card-geometry');
    expect(mocks.createImageWithFallback).toHaveBeenCalledWith({
      src: 'testgame.png',
      alt: 'testgame',
      className: 'game-card__image',
    });
    expect(card.querySelector('.game-card__media img')).not.toBeNull();
    expect(card.querySelector('h2.game-card__title')?.textContent).toBe('testgame');
    expect(card.querySelector('.game-card__badge')?.textContent).toBe('Puzzle');
    expect(card.querySelector('.game-card__description')?.textContent).toBe('Stack the blocks');
    expect(mocks.createStatsBadges).toHaveBeenCalledWith(4.5, 100);
    expect(card.querySelector('.game-card__footer .stats-stub')).not.toBeNull();

    const button = card.querySelector<HTMLButtonElement>('button.game-card__button');
    expect(button?.textContent).toBe('Details');

    button?.click();

    expect(mocks.openDialog).toHaveBeenCalledExactlyOnceWith({ game: 'testgame' });
  });

  it.each([
    { name: 'paid price', price: '$1.00', className: 'game-card__price' },
    {
      name: 'free price',
      price: FREE_PRICE_LABEL.toUpperCase(),
      className: 'game-card__price game-card__price--free',
    },
  ])('renders $name with the right class', ({ price, className }) => {
    const card = createGameCard({ ...game, price });
    const priceElement = card.querySelector('.game-card__heading + span');

    expect(priceElement?.className).toBe(className);
    expect(priceElement?.textContent).toBe(price);
  });
});
