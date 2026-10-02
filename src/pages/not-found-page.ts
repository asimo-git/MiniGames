import { createElement } from '../utils/helpers';
import { handleLinkClick, ROUTE_PATHS } from '../router/router';

export function createNotFoundPage(): HTMLElement {
  return createElement('div', {
    className: 'not-found-page',
    children: [...createContent(), createHomeLink()],
  });
}

function createContent(): HTMLElement[] {
  return [
    createElement('p', {
      className: 'not-found-page__code',
      textContent: '404',
      attributes: { 'aria-hidden': 'true' },
    }),
    createElement('h1', { className: 'not-found-page__title', textContent: 'Page not found' }),
    createElement('p', {
      className: 'not-found-page__text',
      textContent: `Requested URL does not exist`,
    }),
  ];
}

function createHomeLink(): HTMLAnchorElement {
  const link = createElement('a', {
    className: 'not-found-page__button',
    textContent: 'Return to Home Page',
    attributes: { href: ROUTE_PATHS.home },
  });

  link.addEventListener('click', (event) => {
    handleLinkClick(event, ROUTE_PATHS.home);
  });

  return link;
}
