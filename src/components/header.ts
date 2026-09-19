import { ICONS } from '../utils/icons';
import { NAV_LINKS } from '../data/nav-links';
import { createElement } from '../utils/helpers';
import { createBurgerMenu } from './burger-menu';
import { createLogoLink } from './logo-link';
import { createAuthButtons } from './auth-buttons';

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

  for (const { label, href, active } of NAV_LINKS) {
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
