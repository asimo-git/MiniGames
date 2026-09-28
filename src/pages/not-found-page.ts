import { createElement } from '../utils/helpers';
import { handleLinkClick } from '../router/router';

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

//TODO: change the path to the home page
function createHomeLink(): HTMLAnchorElement {
  const link = createElement('a', {
    className: 'not-found-page__button',
    textContent: 'Return to Home Page',
    attributes: { href: '/' },
  });

  link.addEventListener('click', (event) => {
    handleLinkClick(event, '/');
  });

  return link;
}
