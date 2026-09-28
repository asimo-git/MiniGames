import { createNotFoundPage } from '../pages/not-found-page';
import { createHomePage } from '../pages/home-page';
import { createLibraryPage } from '../pages/library-page';

export const ROUTE_PATHS = {
  home: '/',
  library: '/library',
  tournaments: '/tournaments',
  community: '/community',
} as const;

export type RoutePath = (typeof ROUTE_PATHS)[keyof typeof ROUTE_PATHS];

interface RouteConfig {
  label: string;
  render: (routeState: RouteState) => HTMLElement;
}

export interface RouteState {
  path: RoutePath;
  category?: string;
  sort?: string;
  page?: number;
  gameId?: string;
}

export const routes: Record<RoutePath, RouteConfig> = {
  [ROUTE_PATHS.home]: {
    label: 'Home',
    render: createHomePage,
  },

  [ROUTE_PATHS.library]: {
    label: 'Library',
    render: (RouteState) => createLibraryPage(RouteState),
  },

  [ROUTE_PATHS.tournaments]: {
    label: 'Tournaments',
    render: createHomePage,
  },

  [ROUTE_PATHS.community]: {
    label: 'Community',
    render: createHomePage,
  },
};

const state: { main: HTMLElement | undefined } = { main: undefined };

export const ROUTE_CHANGE_EVENT = 'route-change';

export function initRouter(main: HTMLElement): void {
  state.main = main;
  globalThis.addEventListener('popstate', renderRoute);
  renderRoute();
}

function renderRoute(): void {
  if (!state.main) return;

  const routeState = getRouteState();
  const route = routes[routeState.path];
  state.main.replaceChildren(route ? route.render(routeState) : createNotFoundPage());

  globalThis.scrollTo(0, 0);
  globalThis.dispatchEvent(new CustomEvent(ROUTE_CHANGE_EVENT));
}

export function getRouteState(): RouteState {
  const url = new URL(globalThis.location.href);

  //"/about/" → "/about"
  //"/about" → "/about"
  const path =
    url.pathname !== '/' && url.pathname.endsWith('/') ? url.pathname.slice(0, -1) : url.pathname;

  return {
    path: path as RoutePath,
    category: url.searchParams.get('category') ?? undefined,
    sort: url.searchParams.get('sort') ?? undefined,
    page: getPage(url),
    gameId: url.searchParams.get('game') ?? undefined,
  };
}

export function navigate(path: RoutePath): void {
  if (getRouteState().path === path) return;
  globalThis.history.pushState(undefined, '', path);
  renderRoute();
}

export function updateQuery(changes: Record<string, string | number | undefined>): void {
  const url = new URL(globalThis.location.href);

  for (const [key, value] of Object.entries(changes)) {
    if (value === undefined) {
      url.searchParams.delete(key);
    } else {
      url.searchParams.set(key, String(value));
    }
  }

  globalThis.history.pushState(undefined, '', url);
  renderRoute();
}

export function handleLinkClick(event: MouseEvent, href: RoutePath): void {
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
    return;

  event.preventDefault();
  navigate(href);
}

function getPage(url: URL): number | undefined {
  const value = url.searchParams.get('page');

  if (!value) return undefined;
  const page = Number(value);

  return Number.isSafeInteger(page) && page > 0 ? page : undefined;
}
