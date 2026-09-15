import { createElement } from '../utils/helpers';

import type { Link } from '../utils/types';
import { createLogoLink } from './logo-link';

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
  const links: Link[] = [
    { label: 'Home', href: '#', active: true },
    { label: 'Library', href: '#' },
    { label: 'Tournaments', href: '#' },
    { label: 'Community', href: '#' },
  ];

  for (const { label, href, active } of links) {
    const link = createElement('a', {
      className: `header__link${active ? ' header__link--active' : ''}`,
      textContent: label,
      attributes: { href },
    });
    nav.append(link);
  }

  return nav;
}

function createButtons(): HTMLElement {
  const wrapper = createElement('div', { className: 'header__buttons' });

  const logIn = createElement('button', {
    className: 'header__button header__button--outline',
    textContent: 'Log In',
    attributes: { type: 'button' },
  });

  const signUp = createElement('button', {
    className: 'header__button header__button--primary',
    textContent: 'Sign Up',
    attributes: { type: 'button' },
  });

  const burgerMenu = createElement('button', {
    className: 'header__button header__button--burger',
    attributes: { type: 'button', 'aria-label': 'Open menu' },
  });

  burgerMenu.innerHTML = ` <svg width="16" height="10" viewBox="0 0 16 10" aria-hidden="true" > <line x1="0" y1="1" x2="16" y2="1" /> <line x1="0" y1="5" x2="16" y2="5" /> <line x1="0" y1="9" x2="16" y2="9" /> </svg> `;

  wrapper.append(logIn, signUp, burgerMenu);
  return wrapper;
}
