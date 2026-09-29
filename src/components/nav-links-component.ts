import { createElement } from '../utils/helpers';
import {
  getRouteState,
  handleLinkClick,
  ROUTE_CHANGE_EVENT,
  routes,
  type RoutePath,
} from '../router/router';

interface NavLinksOptions {
  linkClassName: string;
  activeLinkClassName: string;
  onNavigate?: () => void;
}

export function createNavLinksComponent(
  nav: HTMLElement,
  { linkClassName, activeLinkClassName, onNavigate }: NavLinksOptions,
): void {
  const routeState = getRouteState();

  for (const [href, { label }] of Object.entries(routes) as [RoutePath, { label: string }][]) {
    const isActive = href === routeState.path;

    const link = createElement('a', {
      className: `${linkClassName}${isActive ? ` ${activeLinkClassName}` : ''}`,
      textContent: label,
      attributes: { href },
    });

    link.addEventListener('click', (event: MouseEvent) => {
      handleLinkClick(event, href);
      onNavigate?.();
    });

    nav.append(link);
  }

  const updateActiveLink = (): void => {
    const currentPath = getRouteState().path;

    for (const link of nav.children) {
      const href = link.getAttribute('href');
      link.classList.toggle(activeLinkClassName, href === currentPath);
    }
  };

  globalThis.addEventListener(ROUTE_CHANGE_EVENT, updateActiveLink);
}
