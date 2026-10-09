import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  getActiveSession: vi.fn(),
  getAvatarLetters: vi.fn(),
  open: vi.fn(),
  createLogoLink: vi.fn(),
  createAuthButtons: vi.fn(),
  createBurgerMenu: vi.fn(),
  createNavLinksComponent: vi.fn(),
}));

vi.mock('../../src/api/login-session', () => ({
  getActiveSession: mocks.getActiveSession,
  SESSION_CHANGED_EVENT: 'session-changed',
}));
vi.mock('../../src/utils/icons', () => ({ ICONS: { burger: '<svg id="burger"></svg>' } }));
// настоящий createElement нужен, подменяем только getAvatarLetters
vi.mock('../../src/utils/helpers', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../src/utils/helpers')>()),
  getAvatarLetters: mocks.getAvatarLetters,
}));
vi.mock('../../src/components/logo-link', () => ({ createLogoLink: mocks.createLogoLink }));
vi.mock('../../src/components/auth-buttons', () => ({
  createAuthButtons: mocks.createAuthButtons,
}));
vi.mock('../../src/components/burger-menu', () => ({ createBurgerMenu: mocks.createBurgerMenu }));
vi.mock('../../src/components/nav-links-component', () => ({
  createNavLinksComponent: mocks.createNavLinksComponent,
}));

import { createHeader } from '../../src/components/header';

describe('createHeader', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.getActiveSession.mockReturnValue(undefined);
    mocks.getAvatarLetters.mockReturnValue('AB');
    mocks.createLogoLink.mockImplementation(() => document.createElement('a'));
    mocks.createAuthButtons.mockImplementation(() => document.createElement('div'));
    mocks.createBurgerMenu.mockImplementation(() => ({
      menu: document.createElement('div'),
      open: mocks.open,
    }));
  });

  it('renders logo, nav, empty profile and a burger button that opens the menu', () => {
    const header = createHeader();
    const nav = header.querySelector('nav.header__links');
    const burger = header.querySelector<HTMLButtonElement>('.header__button--burger');

    expect(header.tagName).toBe('HEADER');
    expect(mocks.createNavLinksComponent).toHaveBeenCalledWith(nav, {
      linkClassName: 'header__link',
      activeLinkClassName: 'header__link--active',
    });
    expect(mocks.createAuthButtons).toHaveBeenCalledWith('header__button');
    expect(header.querySelector('.header__user')?.children).toHaveLength(0);
    expect(burger?.getAttribute('aria-label')).toBe('Open menu');
    expect(burger?.innerHTML).toBe('<svg id="burger"></svg>');

    burger?.click();

    expect(mocks.open).toHaveBeenCalledOnce();
  });

  it.each([
    { name: 'displayName', session: { displayName: 'Ann', email: 'a@x.com' }, expected: 'Ann' },
    { name: 'email prefix', session: { displayName: '', email: 'bob@x.com' }, expected: 'bob' },
    { name: 'User fallback', session: { displayName: '', email: '@x.com' }, expected: 'User' },
  ])('shows the name from $name and initials in the avatar', ({ session, expected }) => {
    mocks.getActiveSession.mockReturnValue(session);

    const header = createHeader();

    expect(header.querySelector('.header__user-name')?.textContent).toBe(expected);
    expect(mocks.getAvatarLetters).toHaveBeenCalledWith(expected);
    expect(header.querySelector('.header__avatar')?.textContent).toBe('AB');
  });

  it('shows the avatar image and falls back to initials on load error', () => {
    mocks.getActiveSession.mockReturnValue({
      displayName: 'Ann',
      email: 'a@x.com',
      avatarUrl: 'https://img/a.png',
    });

    const header = createHeader();
    const avatar = header.querySelector('.header__avatar');
    const image = avatar?.querySelector('img');

    expect(image?.getAttribute('src')).toBe('https://img/a.png');
    expect(image?.getAttribute('alt')).toBe('Ann');

    image?.dispatchEvent(new Event('error'));

    expect(avatar?.querySelector('img')).toBeNull();
    expect(avatar?.textContent).toBe('AB');
  });

  it('shows the default icon when there are no initials', () => {
    mocks.getActiveSession.mockReturnValue({ displayName: 'Ann', email: 'a@x.com' });
    mocks.getAvatarLetters.mockReturnValue('');

    const header = createHeader();
    const image = header.querySelector('.header__avatar img');

    expect(image?.getAttribute('alt')).toBe('');
    expect(image?.getAttribute('src')).toBeTruthy();
  });

  it('re-renders the profile when the session changes', () => {
    const header = createHeader();
    expect(header.querySelector('.header__user-name')).toBeNull();

    mocks.getActiveSession.mockReturnValue({ displayName: 'Ann', email: 'a@x.com' });
    globalThis.dispatchEvent(new Event('session-changed'));

    expect(header.querySelector('.header__user-name')?.textContent).toBe('Ann');
  });
});
