import type { Game } from '../utils/types';
import gamesData from '../data/all-games-seed.json';
import { FILTER_CATEGORIES } from '../data/filter-sort-config';
import { createSortDropdown } from '../components/library-page/sort-dropdown';
import { createElement } from '../utils/helpers';
import { createGameCard } from '../components/library-page/game-card';

const GAMES: Game[] = gamesData.data;

export function createLibraryPage(): HTMLElement {
  return createElement('div', {
    className: 'library-page',
    children: [createHeader(), createToolbar(), createGamesList()],
  });
}

function createHeader(): HTMLElement {
  return createElement('div', {
    className: 'library-page__header',
    children: [
      createElement('h1', { className: 'library-page__title', textContent: 'Game Library' }),
      createElement('p', {
        className: 'library-page__subtitle',
        textContent: 'Browse our collection of casual mini-games',
      }),
    ],
  });
}

function createFilterChip(label: string, isActive: boolean): HTMLButtonElement {
  return createElement('button', {
    className: isActive ? 'library-page__chip library-page__chip--active' : 'library-page__chip',
    textContent: label,
  });
}

function createToolbar(): HTMLElement {
  const chips = FILTER_CATEGORIES.map((category, index) => createFilterChip(category, index === 0));

  return createElement('div', {
    className: 'library-page__toolbar',
    children: [
      createElement('div', {
        className: 'library-page__filters',
        attributes: { role: 'group', 'aria-label': 'Filter by category' },
        children: chips,
      }),
      createSortDropdown(),
    ],
  });
}

function createGamesList(): HTMLElement {
  // const items = GAMES.map((game) =>
  //   createElement('li', {
  //     className: 'library-page__item',
  //     children: [createGameCard(game)],
  //   }),
  // );
  const items = GAMES.map((game) => createGameCard(game));

  return createElement('ul', { className: 'library-page__games', children: items });
}
