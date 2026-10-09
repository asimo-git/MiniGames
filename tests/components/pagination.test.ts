import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  updateQuery: vi.fn(),
  mql: { matches: false, addEventListener: vi.fn() },
}));

vi.mock('../../src/router/router', () => ({ updateQuery: mocks.updateQuery }));

type PaginationModule = typeof import('../../src/components/pagination');

async function loadPagination(): Promise<PaginationModule['createPagination']> {
  vi.resetModules();
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => mocks.mql),
  );
  return (await import('../../src/components/pagination')).createPagination;
}

function parts(navigation: HTMLElement) {
  const buttons = [...navigation.querySelectorAll('button')];

  return { previous: buttons[0], next: buttons.at(-1)!, pages: buttons.slice(1, -1) };
}

const texts = (buttons: HTMLElement[]): (string | null)[] => buttons.map((b) => b.textContent);

describe('createPagination', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.mql.matches = false;
  });

  afterEach(() => {
    document.body.replaceChildren();
    vi.unstubAllGlobals();
  });

  it('renders the first window with state attributes and navigates on click', async () => {
    const createPagination = await loadPagination();
    const navigation = createPagination({ currentPage: 1, totalPages: 10 });
    const { previous, next, pages } = parts(navigation);

    expect(navigation.getAttribute('aria-label')).toBe('Pagination');
    expect(texts(pages)).toEqual(['1', '2', '3', '4']);
    expect(pages[0].classList.contains('pagination__button--active')).toBe(true);
    expect(pages[0].getAttribute('aria-current')).toBe('page');
    expect(pages[1].hasAttribute('aria-current')).toBe(false);
    expect(pages[1].getAttribute('aria-label')).toBe('Page 2');
    expect(previous.disabled).toBe(true);
    expect(next.disabled).toBe(false);

    pages[0].click();
    expect(mocks.updateQuery).not.toHaveBeenCalled();

    pages[2].click();
    expect(mocks.updateQuery).toHaveBeenLastCalledWith({ page: 3 });

    next.click();
    expect(mocks.updateQuery).toHaveBeenLastCalledWith({ page: 2 });
  });

  it('shifts the window near the end and disables Next on the last page', async () => {
    const createPagination = await loadPagination();
    const { previous, next, pages } = parts(createPagination({ currentPage: 9, totalPages: 10 }));

    expect(texts(pages)).toEqual(['7', '8', '9', '10']);
    expect(pages[2].classList.contains('pagination__button--active')).toBe(true);
    expect(next.disabled).toBe(false);

    previous.click();
    expect(mocks.updateQuery).toHaveBeenLastCalledWith({ page: 8 });

    const last = parts(createPagination({ currentPage: 10, totalPages: 10 }));
    expect(last.next.disabled).toBe(true);
  });

  it('shows fewer buttons on mobile', async () => {
    mocks.mql.matches = true;
    const createPagination = await loadPagination();

    const { pages } = parts(createPagination({ currentPage: 1, totalPages: 10 }));

    expect(pages).toHaveLength(3);
  });
});
