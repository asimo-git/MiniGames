import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  createLogoLink: vi.fn(() => document.createElement('a')),
  createAuthButtons: vi.fn(() => document.createElement('div')),
  createNavLinksComponent: vi.fn(),
}));

vi.mock('../../src/utils/icons', () => ({ ICONS: { close: '<svg id="close"></svg>' } }));
vi.mock('../../src/components/logo-link', () => ({ createLogoLink: mocks.createLogoLink }));
vi.mock('../../src/components/auth-buttons', () => ({
  createAuthButtons: mocks.createAuthButtons,
}));
vi.mock('../../src/components/nav-links-component', () => ({
  createNavLinksComponent: mocks.createNavLinksComponent,
}));

import { createBurgerMenu } from '../../src/components/burger-menu';

const OPEN_CLASS = 'header__mobile-menu--open';

const pressKey = (key: string): void => {
  document.dispatchEvent(new KeyboardEvent('keydown', { key }));
};

describe('createBurgerMenu', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('assembles the menu from logo, close button, nav links and auth buttons', () => {
    const { menu } = createBurgerMenu();
    const [topRow, nav, authButtons] = [...menu.children];
    const closeButton = topRow.querySelector('button');

    expect(menu.className).toBe('header__mobile-menu');
    expect(topRow.firstElementChild?.tagName).toBe('A');
    expect(closeButton?.getAttribute('type')).toBe('button');
    expect(closeButton?.getAttribute('aria-label')).toBe('Close menu');
    expect(closeButton?.innerHTML).toBe('<svg id="close"></svg>');
    expect(nav.className).toBe('header__mobile-menu-links');
    expect(authButtons.tagName).toBe('DIV');
    expect(mocks.createLogoLink).toHaveBeenCalledWith('light');
    expect(mocks.createNavLinksComponent).toHaveBeenCalledWith(
      nav,
      expect.objectContaining({
        linkClassName: 'header__mobile-menu-link',
        activeLinkClassName: 'header__mobile-menu-link--active',
      }),
    );
    expect(mocks.createAuthButtons).toHaveBeenCalledWith(
      'header__mobile-menu-button',
      expect.any(Function),
    );
  });

  it('closes on Escape only when open and ignores other keys', () => {
    const { menu, open } = createBurgerMenu();

    open();
    pressKey('Enter');
    expect(menu.classList.contains(OPEN_CLASS)).toBe(true);

    pressKey('Escape');
    expect(menu.classList.contains(OPEN_CLASS)).toBe(false);
  });
});
