import { createNotFoundPage } from '../pages/not-found-page';
import { createHomePage } from '../pages/home-page';
import { createLibraryPage } from '../pages/library-page';

export type RoutePath = '/' | '/library' | '/tournaments' | '/community';

interface RouteConfig {
  label: string;
  render: () => HTMLElement;
}

export const routes: Record<RoutePath, RouteConfig> = {
  '/': { label: 'Home', render: createHomePage },
  '/library': { label: 'Library', render: createLibraryPage },
  '/tournaments': { label: 'Tournaments', render: createHomePage },
  '/community': { label: 'Community', render: createHomePage },
};

//"/about/" → "/about"
//"/about" → "/about"
export function getCurrentPath(): string {
  const path = globalThis.location.pathname;

  return path !== '/' && path.endsWith('/') ? path.slice(0, -1) : path;
}

const state: { main: HTMLElement | undefined } = { main: undefined };

export const ROUTE_CHANGE_EVENT = 'route-change';

function renderRoute(): void {
  if (!state.main) return;

  const path = getCurrentPath();
  const route = routes[path as RoutePath];
  state.main.replaceChildren(route ? route.render() : createNotFoundPage());

  globalThis.scrollTo(0, 0);
  globalThis.dispatchEvent(new CustomEvent(ROUTE_CHANGE_EVENT));
}

export function initRouter(main: HTMLElement): void {
  state.main = main;
  globalThis.addEventListener('popstate', renderRoute);
  renderRoute();
}

export function navigate(path: string): void {
  if (getCurrentPath() === path) return;
  globalThis.history.pushState(undefined, '', path);
  renderRoute();
}

export function handleLinkClick(event: MouseEvent, href: RoutePath): void {
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
    return;

  event.preventDefault();
  navigate(href);
}
