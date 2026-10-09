import { describe, expect, it, vi } from 'vitest';

const { sections } = vi.hoisted(() => {
  const make = (name: string) => {
    const element = document.createElement('section');
    element.dataset.name = name;
    return element;
  };

  return {
    sections: {
      hero: make('hero'),
      carousel: make('carousel'),
      leaderboard: make('leaderboard'),
      developers: make('developers'),
    },
  };
});

vi.mock('../../src/components/home-page/hero', () => ({ createHero: () => sections.hero }));
vi.mock('../../src/components/home-page/carousel-section', () => ({
  createCarouselSection: () => sections.carousel,
}));
vi.mock('../../src/components/home-page/leaderboard-section', () => ({
  createLeaderboardSection: () => sections.leaderboard,
}));
vi.mock('../../src/components/home-page/game-developers-section', () => ({
  createGameDevelopersSection: () => sections.developers,
}));

import { createHomePage } from '../../src/pages/home-page';

describe('createHomePage', () => {
  it('assembles all sections in order', () => {
    const page = createHomePage();

    expect([...page.children]).toEqual([
      sections.hero,
      sections.carousel,
      sections.leaderboard,
      sections.developers,
    ]);
  });
});
