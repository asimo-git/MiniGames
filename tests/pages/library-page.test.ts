import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => {
  const el = (tag: string, name: string) => {
    const element = document.createElement(tag);
    element.dataset.name = name;
    return element;
  };

  return {
    updateQuery: vi.fn(),
    mountAsyncSection: vi.fn(),
    getCategories: vi.fn(),
    getGames: vi.fn(),
    createSortDropdown: vi.fn(() => el('div', 'sort')),
    createGameCard: vi.fn((game: { slug: string }) => el('li', `card-${game.slug}`)),
    createPagination: vi.fn(() => el('nav', 'pagination')),
    createEmptyState: vi.fn(() => el('div', 'empty')),
    createArraySkeletons: vi.fn(() => [el('span', 'skeleton')]),
  };
});

vi.mock('../../src/router/router', () => ({ updateQuery: mocks.updateQuery }));
vi.mock('../../src/api/endpoints', () => ({
  api: { getCategories: mocks.getCategories, getGames: mocks.getGames },
}));
vi.mock('../../src/utils/mount-sync-section', () => ({
  mountAsyncSection: mocks.mountAsyncSection,
}));
vi.mock('../../src/components/library-page/sort-dropdown', () => ({
  createSortDropdown: mocks.createSortDropdown,
}));
vi.mock('../../src/components/library-page/game-card', () => ({
  createGameCard: mocks.createGameCard,
}));
vi.mock('../../src/components/pagination', () => ({ createPagination: mocks.createPagination }));
vi.mock('../../src/components/empty-state', () => ({ createEmptyState: mocks.createEmptyState }));
vi.mock('../../src/components/skeleton', () => ({
  createArraySkeletons: mocks.createArraySkeletons,
}));

import { createLibraryPage } from '../../src/pages/library-page';

interface Section {
  load: () => Promise<unknown>;
  render: (data: unknown) => Node[];
  skeleton: () => Node[];
  errorSize?: string;
}

const categories = [
  { slug: 'all', label: 'All', isDefault: true },
  { slug: 'puzzle', label: 'Puzzle', isDefault: false },
];

function build(routeState: object = { path: '/library' }) {
  const page = createLibraryPage(routeState as never);
  const [filtersCall, contentCall] = mocks.mountAsyncSection.mock.calls as [
    [HTMLElement, Section],
    [HTMLElement, Section],
  ];

  return {
    page,
    filters: { container: filtersCall[0], options: filtersCall[1] },
    content: { container: contentCall[0], options: contentCall[1] },
  };
}

describe('createLibraryPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('builds header, toolbar and content and mounts both async sections', () => {
    const { page, filters, content } = build({ path: '/library', sort: 'popular' });

    expect(page.className).toBe('library-page');
    expect(page.querySelector('h1')?.textContent).toBe('Game Library');
    expect(page.querySelector('.library-page__subtitle')?.textContent).toBe(
      'Browse our collection of casual mini-games',
    );
    expect(mocks.createSortDropdown).toHaveBeenCalledWith('popular');

    const toolbar = page.querySelector('.library-page__toolbar');
    expect(toolbar?.firstElementChild).toBe(filters.container);
    expect(filters.container.getAttribute('role')).toBe('group');
    expect(filters.container.getAttribute('aria-label')).toBe('Filter by category');
    expect(toolbar?.lastElementChild?.getAttribute('data-name')).toBe('sort');
    expect(page.lastElementChild).toBe(content.container);
    expect(content.container.className).toBe('library-page__content');
  });

  describe('filters section', () => {
    it('loads categories and shows chip skeletons', () => {
      mocks.getCategories.mockResolvedValue(categories);
      const { filters } = build();

      void filters.options.load();
      filters.options.skeleton();

      expect(mocks.getCategories).toHaveBeenCalledOnce();
      expect(filters.options.errorSize).toBe('compact');
      expect(mocks.createArraySkeletons).toHaveBeenCalledWith({
        tag: 'span',
        width: '96px',
        count: 7,
        className: 'library-page__chip-geometry',
      });
    });

    it('activates the category from the route', () => {
      const { filters } = build({ path: '/library', category: 'puzzle' });

      const chips = filters.options.render(categories) as HTMLButtonElement[];

      expect(chips.map((chip) => chip.textContent)).toEqual(['All', 'Puzzle']);
      expect(chips[0].classList.contains('library-page__chip--active')).toBe(false);
      expect(chips[1].classList.contains('library-page__chip--active')).toBe(true);
    });

    it.each([
      { name: 'default category drops the param', index: 0, category: undefined },
      { name: 'regular category sets its slug', index: 1, category: 'puzzle' },
    ])('chip click: $name and resets the page', ({ index, category }) => {
      const { filters } = build();
      const chips = filters.options.render(categories) as HTMLButtonElement[];

      chips[index].click();

      expect(mocks.updateQuery).toHaveBeenCalledExactlyOnceWith({ category, page: 1 });
    });
  });

  describe('content section', () => {
    it('shows a skeleton list of game cards', () => {
      const { content } = build();

      const [list] = content.options.skeleton() as HTMLElement[];

      expect(list.tagName).toBe('UL');
      expect(list.className).toBe('library-page__games');
      expect(mocks.createArraySkeletons).toHaveBeenCalledWith({
        tag: 'li',
        width: '100%',
        count: 6,
        className: 'game-card-geometry',
      });
    });

    it.each([
      { name: 'defaults to page 1', route: {}, params: { page: 1, limit: 6 } },
      {
        name: 'passes route params',
        route: { page: 3, category: 'puzzle', sort: 'popular' },
        params: { page: 3, limit: 6, category: 'puzzle', sort: 'popular' },
      },
    ])('load $name', async ({ route, params }) => {
      const meta = { page: 1, totalPages: 1, totalItems: 1 };
      mocks.getGames.mockResolvedValue({ data: [{ slug: 'a' }], meta });
      const { content } = build({ path: '/library', ...route });

      const result = await content.options.load();

      expect(mocks.getGames).toHaveBeenCalledWith(expect.objectContaining(params));
      expect(result).toEqual({ games: [{ slug: 'a' }], meta });
    });

    it('renders the games list and pagination', () => {
      const { content } = build();
      const meta = { page: 1, totalPages: 2, totalItems: 2 };

      const nodes = content.options.render({
        games: [{ slug: 'a' }, { slug: 'b' }],
        meta,
      }) as HTMLElement[];

      expect(nodes).toHaveLength(2);
      expect(nodes[0].className).toBe('library-page__games');
      expect([...nodes[0].children].map((card) => card.getAttribute('data-name'))).toEqual([
        'card-a',
        'card-b',
      ]);
      expect(mocks.createPagination).toHaveBeenCalledWith({ totalPages: 2, currentPage: 1 });
    });

    it('renders the empty state when there are no games', () => {
      const { content } = build();

      const nodes = content.options.render({
        games: [],
        meta: { page: 1, totalPages: 0, totalItems: 0 },
      }) as HTMLElement[];

      expect(mocks.createEmptyState).toHaveBeenCalledWith('No games found');
      expect(mocks.createGameCard).not.toHaveBeenCalled();
    });

    it('redirects to the last page when the requested page is out of range', () => {
      const { content } = build({ path: '/library', page: 5 });

      const nodes = content.options.render({
        games: [],
        meta: { page: 5, totalPages: 2, totalItems: 12 },
      });

      expect(nodes).toEqual([]);
      expect(mocks.updateQuery).toHaveBeenCalledWith({ page: 2 }, { replace: true });
    });
  });
});
