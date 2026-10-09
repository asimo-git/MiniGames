import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ openDialog: vi.fn() }));

vi.mock('../../../src/router/dialog-router', () => ({ openDialog: mocks.openDialog }));

vi.mock('../../../src/utils/helpers', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../../src/utils/helpers')>()),
  formatCount: (value: number) => `fmt:${value}`,
}));

import type { GameSummary } from '../../../src/api/types';
import { createGameCard, updateGameCard } from '../../../src/components/home-page/carousel-card';

const game = {
  slug: 'tetris',
  name: 'Tetris',
  cardImage: 'tetris.png',
  rating: 4.26,
  likesCount: 120,
} as GameSummary;

const other = {
  slug: 'snake',
  name: 'Snake',
  cardImage: 'snake.png',
  rating: 3.5,
  likesCount: 7,
} as GameSummary;

describe('carousel card', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('createGameCard renders image, title, meta and opens the game dialog on click', () => {
    const card = createGameCard(game, 'main');

    expect(card.root.className).toBe('carousel__card carousel__card--main');
    expect(card.image.getAttribute('src')).toBe('tetris.png');
    expect(card.image.getAttribute('alt')).toBe('Tetris');
    expect(card.title.textContent).toBe('Tetris');
    expect(card.ratingText.textContent).toBe('4.3');
    expect(card.likesText.textContent).toBe('fmt:120');
    expect(card.root.querySelector('.carousel__card-rating img')?.getAttribute('alt')).toBe('');

    card.root.querySelector<HTMLElement>('.carousel__card-image-wrapper')?.click();

    expect(mocks.openDialog).toHaveBeenCalledExactlyOnceWith({ game: 'tetris' });
  });

  it('updateGameCard replaces the content and switches the variant', () => {
    const card = createGameCard(game, 'main');

    updateGameCard(card, other, 'secondary');

    expect(card.image.getAttribute('src')).toBe('snake.png');
    expect(card.image.getAttribute('alt')).toBe('Snake');
    expect(card.title.textContent).toBe('Snake');
    expect(card.ratingText.textContent).toBe('3.5');
    expect(card.likesText.textContent).toBe('fmt:7');
    expect(card.root.classList.contains('carousel__card--main')).toBe(false);
    expect(card.root.classList.contains('carousel__card--secondary')).toBe(true);
  });
});
