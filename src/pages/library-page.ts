import { createSortDropdown } from '../components/library-page/sort-dropdown';
import { createElement } from '../utils/helpers';
import { createGameCard } from '../components/library-page/game-card';
import { createPagination } from '../components/pagination';
import { updateQuery, type RouteState } from '../router/router';
import type { Category, GamesListMeta, GameSummary } from '../api/types';
import { api } from '../api/endpoints';
import { mountAsyncSection } from '../utils/mount-sync-section';

const GAMES_PER_PAGE = 6;

interface GamesData {
  games: GameSummary[];
  meta: GamesListMeta;
}

export function createLibraryPage(routeState: RouteState): HTMLElement {
  const filters = createFiltersContainer();
  const content = createElement('div', { className: 'library-page__content' });

  void mountAsyncSection(filters, {
    load: () => api.getCategories(),
    render: (categories) => renderFilters(categories, routeState),
    placeholder: () => [createLoading()],
  });

  void mountAsyncSection(content, {
    load: () => loadGames(routeState),
    render: (data) => renderGames(data, routeState),
    placeholder: () => [createLoading()],
  });

  return createElement('div', {
    className: 'library-page',
    children: [createHeader(), createToolbar(filters, routeState.sort), content],
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

function createFiltersContainer(): HTMLElement {
  return createElement('div', {
    className: 'library-page__filters',
    attributes: { role: 'group', 'aria-label': 'Filter by category' },
  });
}

function createToolbar(filters: HTMLElement, sort: RouteState['sort']): HTMLElement {
  return createElement('div', {
    className: 'library-page__toolbar',
    children: [filters, createSortDropdown(sort)],
  });
}

function createFilterChip(category: Category, isActive: boolean): HTMLButtonElement {
  const filterButton = createElement('button', {
    className: isActive ? 'library-page__chip library-page__chip--active' : 'library-page__chip',
    textContent: category.label, // на кнопке label
  });

  filterButton.addEventListener('click', () => {
    updateQuery({
      category: category.isDefault ? undefined : category.slug, // в URL slug
      page: 1,
    });
  });

  return filterButton;
}

function createGamesList(games: GameSummary[]): HTMLElement {
  return createElement('ul', {
    className: 'library-page__games',
    children: games.map((game) => createGameCard(game)),
  });
}

function createLoading(): HTMLElement {
  return createElement('p', { className: 'library-page__status', textContent: 'Loading…' });
}

/////////////////////// async processes //////////////////////

async function loadGames(routeState: RouteState): Promise<GamesData> {
  const { data, meta } = await api.getGames({
    page: routeState.page ?? 1,
    limit: GAMES_PER_PAGE,
    category: routeState.category,
    sort: routeState.sort,
  });

  return { games: data, meta };
}

function renderFilters(categories: Category[], routeState: RouteState): HTMLElement[] {
  const fromRoute = routeState.category
    ? categories.find((category) => category.slug === routeState.category)
    : undefined;

  const active = fromRoute ?? categories.find((category) => category.isDefault);
  console.log('active', active);
  return categories.map((category) => createFilterChip(category, category.slug === active?.slug));
}

function renderGames({ games, meta }: GamesData, routeState: RouteState): Node[] {
  if (meta.totalPages > 0 && (routeState.page ?? 1) > meta.totalPages) {
    updateQuery({ page: meta.totalPages }, { replace: true });
    return [];
  }

  if (games.length === 0) {
    return [
      createElement('p', { className: 'library-page__status', textContent: 'No games found' }),
    ];
  }

  return [
    createGamesList(games),
    createPagination({ totalPages: meta.totalPages, currentPage: meta.page }),
  ];
}
