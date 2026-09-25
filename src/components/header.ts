import { ICONS } from '../utils/icons';
import { createElement } from '../utils/helpers';
import { createBurgerMenu } from './burger-menu';
import { createLogoLink } from './logo-link';
import { createAuthButtons } from './auth-buttons';
import {
  getCurrentPath,
  handleLinkClick,
  ROUTE_CHANGE_EVENT,
  routes,
  type RoutePath,
} from '../router/router';

export function createHeader(): HTMLElement {
  const header = createElement('header', { className: 'header' });
  header.append(createLogoLink(), createNavActions());
  return header;
}

function createNavActions(): HTMLElement {
  const navActions = createElement('div', { className: 'header__actions-bar' });
  navActions.append(createNavLinks(), createButtons());
  return navActions;
}

function createNavLinks(): HTMLElement {
  const nav = createElement('nav', { className: 'header__links' });

  for (const [href, { label }] of Object.entries(routes) as [RoutePath, { label: string }][]) {
    const isActive = href === getCurrentPath();

    const link = createElement('a', {
      className: `header__link${isActive ? ' header__link--active' : ''}`,
      textContent: label,
      attributes: { href },
    });

    link.addEventListener('click', (event: MouseEvent) => handleLinkClick(event, href));
    nav.append(link);
  }

  const updateActiveLink = (): void => {
    const currentPath = getCurrentPath();
    for (const link of nav.children) {
      const href = link.getAttribute('href');
      link.classList.toggle('header__link--active', href === currentPath);
    }
  };

  globalThis.addEventListener(ROUTE_CHANGE_EVENT, updateActiveLink);

  return nav;
}

function createButtons(): HTMLElement {
  const wrapper = createElement('div', { className: 'header__buttons' });
  const { menu, open } = createBurgerMenu();

  const burgerButton = createElement('button', {
    className: 'header__button header__button--burger',
    attributes: { type: 'button', 'aria-label': 'Open menu' },
  });
  burgerButton.innerHTML = ICONS.burger;
  burgerButton.addEventListener('click', () => open());

  wrapper.append(createAuthButtons('header__button'), burgerButton, menu);
  return wrapper;
}
