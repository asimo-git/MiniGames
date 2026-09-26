import { ICONS } from '../utils/icons';
import { createElement } from '../utils/helpers';
import { createBurgerMenu } from './burger-menu';
import { createLogoLink } from './logo-link';
import { createAuthButtons } from './auth-buttons';
import { createNavLinksComponent } from './nav-links-component';

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

  createNavLinksComponent(nav, {
    linkClassName: 'header__link',
    activeLinkClassName: 'header__link--active',
  });

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
