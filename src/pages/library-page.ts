import type { Game } from '../utils/types';
import gamesData from '../data/all-games-seed.json';
import { FILTER_CATEGORIES } from '../data/filter-sort-config';
import { createSortDropdown } from '../components/library-page/sort-dropdown';
import { createElement } from '../utils/helpers';
import { createGameCard } from '../components/library-page/game-card';
import { createPagination } from '../components/pagination';

const GAMES: Game[] = gamesData.data;

const GAMES_PER_PAGE = 6;
const TOTAL_PAGES = Math.max(Math.ceil(GAMES.length / GAMES_PER_PAGE), 1);

export function createLibraryPage(): HTMLElement {
  const gamesList = createGamesList();

  function showPage(pageNumber: number): void {
    gamesList.replaceChildren(...createGameItems(pageNumber));
  }

  const pagination = createPagination({
    totalPages: TOTAL_PAGES,
    onPageChange: showPage,
  });

  return createElement('div', {
    className: 'library-page',
    children: [createHeader(), createToolbar(), gamesList, pagination],
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

function createGameItems(pageNumber: number): HTMLElement[] {
  const startIndex = (pageNumber - 1) * GAMES_PER_PAGE;
  const pageGames = GAMES.slice(startIndex, startIndex + GAMES_PER_PAGE);

  return pageGames.map((game) => createGameCard(game));
}

function createGamesList(): HTMLElement {
  return createElement('ul', {
    className: 'library-page__games',
    children: createGameItems(1),
  });
}
