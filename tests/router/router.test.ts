import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { createHomePage, createLibraryPage, createNotFoundPage } = vi.hoisted(() => ({
  createHomePage: vi.fn(() => document.createElement('div')),
  createLibraryPage: vi.fn(() => document.createElement('div')),
  createNotFoundPage: vi.fn(() => document.createElement('div')),
}));

vi.mock('../../src/pages/home-page', () => ({ createHomePage }));
vi.mock('../../src/pages/library-page', () => ({ createLibraryPage }));
vi.mock('../../src/pages/not-found-page', () => ({ createNotFoundPage }));

type RouterModule = typeof import('../../src/router/router');

async function loadRouter(): Promise<RouterModule> {
  vi.resetModules();
  return import('../../src/router/router');
}

function setUrl(url: string): void {
  globalThis.history.replaceState(undefined, '', url);
}

describe('router', () => {
  let main: HTMLElement;
  let popstateListeners: EventListenerOrEventListenerObject[];
  let scrollTo: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    main = document.createElement('div');
    popstateListeners = [];
    setUrl('/');

    scrollTo = vi.spyOn(globalThis, 'scrollTo').mockImplementation(() => {});

    const originalAdd = globalThis.addEventListener.bind(globalThis);
    vi.spyOn(globalThis, 'addEventListener').mockImplementation(
      (
        type: string,
        listener: EventListenerOrEventListenerObject,
        options?: boolean | AddEventListenerOptions,
      ) => {
        if (type === 'popstate') popstateListeners.push(listener);
        originalAdd(type, listener, options);
      },
    );
  });

  afterEach(() => {
    for (const listener of popstateListeners) {
      globalThis.removeEventListener('popstate', listener);
    }
    vi.restoreAllMocks();
  });

  describe('getRouteState', () => {
    it('parses all query params', async () => {
      const { getRouteState } = await loadRouter();
      setUrl('/library?category=puzzle&sort=popular&page=3&game=42&auth=login');

      expect(getRouteState()).toEqual({
        path: '/library',
        category: 'puzzle',
        sort: 'popular',
        page: 3,
        gameId: '42',
        auth: 'login',
      });
    });

    it('returns undefined for missing params', async () => {
      const { getRouteState } = await loadRouter();

      expect(getRouteState()).toEqual({
        path: '/',
        category: undefined,
        sort: undefined,
        page: undefined,
        gameId: undefined,
        auth: undefined,
      });
    });

    it('strips the trailing slash but keeps the root path', async () => {
      const { getRouteState } = await loadRouter();

      setUrl('/library/');
      expect(getRouteState().path).toBe('/library');

      setUrl('/');
      expect(getRouteState().path).toBe('/');
    });

    it('accepts register and rejects unknown auth modes', async () => {
      const { getRouteState } = await loadRouter();

      setUrl('/?auth=register');
      expect(getRouteState().auth).toBe('register');

      setUrl('/?auth=hacker');
      expect(getRouteState().auth).toBeUndefined();
    });

    it.each(['0', '-1', 'abc', '1.5', ''])('ignores invalid page "%s"', async (value) => {
      const { getRouteState } = await loadRouter();
      setUrl(`/library?page=${value}`);

      expect(getRouteState().page).toBeUndefined();
    });
  });

  describe('initRouter and rendering', () => {
    it('renders the current route into main and scrolls to top', async () => {
      const { initRouter } = await loadRouter();
      const page = document.createElement('div');
      createHomePage.mockReturnValueOnce(page);

      initRouter(main);

      expect(main.firstElementChild).toBe(page);
      expect(scrollTo).toHaveBeenCalledWith(0, 0);
    });

    it('passes the route state to the library page', async () => {
      const { initRouter } = await loadRouter();
      setUrl('/library?category=puzzle&sort=popular&page=2');

      initRouter(main);

      expect(createLibraryPage).toHaveBeenCalledWith(
        expect.objectContaining({
          path: '/library',
          category: 'puzzle',
          sort: 'popular',
          page: 2,
        }),
      );
    });

    it.each(['/tournaments', '/community'])('renders the home page stub for %s', async (path) => {
      const { initRouter } = await loadRouter();
      setUrl(path);

      initRouter(main);

      expect(createHomePage).toHaveBeenCalledOnce();
    });

    it('renders the not-found page for an unknown path', async () => {
      const { initRouter } = await loadRouter();
      setUrl('/nope');

      initRouter(main);

      expect(createNotFoundPage).toHaveBeenCalledOnce();
      expect(createHomePage).not.toHaveBeenCalled();
    });

    it('re-renders on popstate', async () => {
      const { initRouter } = await loadRouter();
      initRouter(main);

      setUrl('/library');
      globalThis.dispatchEvent(new PopStateEvent('popstate'));

      expect(createLibraryPage).toHaveBeenCalledOnce();
    });

    it('dispatches route-change on every render', async () => {
      const { initRouter, ROUTE_CHANGE_EVENT } = await loadRouter();
      const onChange = vi.fn();
      globalThis.addEventListener(ROUTE_CHANGE_EVENT, onChange);

      initRouter(main);

      expect(onChange).toHaveBeenCalledOnce();
      globalThis.removeEventListener(ROUTE_CHANGE_EVENT, onChange);
    });
  });

  describe('navigate', () => {
    it('pushes a new path and renders it', async () => {
      const { initRouter, navigate, ROUTE_PATHS } = await loadRouter();
      initRouter(main);

      navigate(ROUTE_PATHS.library);

      expect(globalThis.location.pathname).toBe('/library');
      expect(createLibraryPage).toHaveBeenCalledOnce();
    });

    it('does nothing when already on the path', async () => {
      const { initRouter, navigate, ROUTE_PATHS } = await loadRouter();
      initRouter(main);
      const lengthBefore = globalThis.history.length;

      navigate(ROUTE_PATHS.home);

      expect(globalThis.history.length).toBe(lengthBefore);
      expect(createHomePage).toHaveBeenCalledOnce();
    });
  });

  describe('updateQuery', () => {
    it('sets and removes params and pushes history', async () => {
      const { initRouter, updateQuery } = await loadRouter();
      setUrl('/library?category=old&page=2');
      initRouter(main);

      updateQuery({ category: undefined, sort: 'popular', page: 1 });

      expect(globalThis.location.search).toBe('?page=1&sort=popular');
    });

    it('passes state to pushState', async () => {
      const { initRouter, updateQuery } = await loadRouter();
      initRouter(main);

      updateQuery({ game: '7' }, { state: { from: 'test' } });

      expect(globalThis.history.state).toEqual({ from: 'test' });
    });

    it('does not re-render the page when only dialog params change', async () => {
      const { initRouter, updateQuery, ROUTE_CHANGE_EVENT } = await loadRouter();
      setUrl('/library');
      initRouter(main);
      const onChange = vi.fn();
      globalThis.addEventListener(ROUTE_CHANGE_EVENT, onChange);

      updateQuery({ game: '5' });
      updateQuery({ auth: 'login' });

      expect(createLibraryPage).toHaveBeenCalledOnce();
      expect(onChange).toHaveBeenCalledTimes(2);
      globalThis.removeEventListener(ROUTE_CHANGE_EVENT, onChange);
    });

    it('re-renders when page params change', async () => {
      const { initRouter, updateQuery } = await loadRouter();
      setUrl('/library');
      initRouter(main);

      updateQuery({ page: 2 });

      expect(createLibraryPage).toHaveBeenCalledTimes(2);
    });
  });

  describe('handleLinkClick', () => {
    it('prevents default and navigates on a plain left click', async () => {
      const { initRouter, handleLinkClick, ROUTE_PATHS } = await loadRouter();
      initRouter(main);
      const event = new MouseEvent('click', { button: 0, cancelable: true });

      handleLinkClick(event, ROUTE_PATHS.library);

      expect(event.defaultPrevented).toBe(true);
      expect(globalThis.location.pathname).toBe('/library');
    });

    it.each([
      { name: 'middle button', init: { button: 1 } },
      { name: 'meta key', init: { button: 0, metaKey: true } },
      { name: 'ctrl key', init: { button: 0, ctrlKey: true } },
      { name: 'shift key', init: { button: 0, shiftKey: true } },
      { name: 'alt key', init: { button: 0, altKey: true } },
    ])('ignores click with $name', async ({ init }) => {
      const { initRouter, handleLinkClick, ROUTE_PATHS } = await loadRouter();
      initRouter(main);
      const event = new MouseEvent('click', { ...init, cancelable: true });

      handleLinkClick(event, ROUTE_PATHS.library);

      expect(event.defaultPrevented).toBe(false);
      expect(globalThis.location.pathname).toBe('/');
    });
  });
});
