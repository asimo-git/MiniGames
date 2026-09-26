import { ICONS } from '../utils/icons';
import { createElement } from '../utils/helpers';
import { createLogoLink } from './logo-link';
import { createAuthButtons } from './auth-buttons';
// import { getCurrentPath, handleLinkClick, routes, type RoutePath } from '../router/router';
import { createNavLinksComponent } from './nav-links-component';

const OPEN_CLASS = 'header__mobile-menu--open';

export interface BurgerMenu {
  menu: HTMLElement;
  open(): void;
}

export function createBurgerMenu(): BurgerMenu {
  const menu = createElement('div', { className: 'header__mobile-menu' });

  const open = (): void => {
    menu.classList.add(OPEN_CLASS);
  };

  const close = (): void => {
    menu.classList.remove(OPEN_CLASS);
  };

  const topRow = createElement('div', { className: 'header__mobile-menu-top' });
  topRow.append(createLogoLink('light'), createCloseButton(close));

  menu.append(
    topRow,
    createMobileMenuLinks(close),
    createAuthButtons('header__mobile-menu-button', close),
  );

  document.addEventListener('keydown', (event: KeyboardEvent): void => {
    if (event.key === 'Escape' && menu.classList.contains(OPEN_CLASS)) {
      close();
    }
  });

  return { menu, open };
}

function createCloseButton(onClose: () => void): HTMLElement {
  const button = createElement('button', {
    className: 'header__mobile-menu-close',
    attributes: { type: 'button', 'aria-label': 'Close menu' },
  });

  button.innerHTML = ICONS.close;
  button.addEventListener('click', onClose);
  return button;
}

function createMobileMenuLinks(onNavigate: () => void): HTMLElement {
  const nav = createElement('nav', { className: 'header__mobile-menu-links' });

  createNavLinksComponent(nav, {
    linkClassName: 'header__mobile-menu-link',
    activeLinkClassName: 'header__mobile-menu-link--active',
    onNavigate,
  });

  return nav;
}
