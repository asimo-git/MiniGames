import { ICONS } from '../utils/icons';
import { createElement, getAvatarLetters } from '../utils/helpers';
import { createBurgerMenu } from './burger-menu';
import { createLogoLink } from './logo-link';
import { createAuthButtons } from './auth-buttons';
import { createNavLinksComponent } from './nav-links-component';
import { getActiveSession, SESSION_CHANGED_EVENT, type AppSession } from '../api/login-session';
import avatarIcon from '../assets/icons/logo.svg';

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
  const profile = createElement('div', { className: 'header__user' });

  const renderProfile = (): void => {
    const session = getActiveSession();
    profile.replaceChildren(...(session ? createProfileContent(session) : []));
  };

  renderProfile();
  globalThis.addEventListener(SESSION_CHANGED_EVENT, renderProfile);

  const burgerButton = createElement('button', {
    className: 'header__button header__button--burger',
    attributes: { type: 'button', 'aria-label': 'Open menu' },
  });
  burgerButton.innerHTML = ICONS.burger;
  burgerButton.addEventListener('click', () => open());

  wrapper.append(profile, createAuthButtons('header__button'), burgerButton, menu);
  return wrapper;
}

function createProfileContent(session: AppSession): HTMLElement[] {
  const name = session.displayName || session.email.split('@', 1)[0] || 'User';

  const nameElement = createElement('span', { className: 'header__user-name', textContent: name });
  const avatar = createElement('div', { className: 'header__avatar' });
  renderAvatar(avatar, session.avatarUrl, name);

  return [nameElement, avatar];
}

function renderAvatar(avatar: HTMLElement, avatarUrl: string | undefined, name: string): void {
  const showInitialsFallback = (): void => {
    const initials = getAvatarLetters(name);

    if (initials) {
      avatar.replaceChildren();
      avatar.textContent = initials;
    } else {
      const img = createElement('img', {
        attributes: { src: avatarIcon, alt: '' },
      });
      avatar.replaceChildren(img);
    }
  };

  if (!avatarUrl) {
    showInitialsFallback();
    return;
  }

  const image = createElement('img', {
    className: 'header__avatar-image',
    attributes: { src: avatarUrl, alt: name },
  });

  image.addEventListener('error', showInitialsFallback);
  avatar.replaceChildren(image);
}
