import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  getRouteState: vi.fn(),
  handleLinkClick: vi.fn(),
}));

vi.mock('../../src/router/router', () => ({
  getRouteState: mocks.getRouteState,
  handleLinkClick: mocks.handleLinkClick,
  ROUTE_CHANGE_EVENT: 'route-change',
  routes: {
    '/': { label: 'Home' },
    '/library': { label: 'Library' },
  },
}));

import { createNavLinksComponent } from '../../src/components/nav-links-component';

const options = { linkClassName: 'link', activeLinkClassName: 'link--active' };

describe('createNavLinksComponent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getRouteState.mockReturnValue({ path: '/library' });
  });

  it('renders a link per route, marks the current one and delegates clicks', () => {
    const nav = document.createElement('nav');
    const onNavigate = vi.fn();

    createNavLinksComponent(nav, { ...options, onNavigate });
    const [home, library] = [...nav.querySelectorAll('a')];

    expect(home.textContent).toBe('Home');
    expect(home.getAttribute('href')).toBe('/');
    expect(home.className).toBe('link');
    expect(library.getAttribute('href')).toBe('/library');
    expect(library.className).toBe('link link--active');

    home.click();

    expect(mocks.handleLinkClick).toHaveBeenCalledExactlyOnceWith(expect.any(MouseEvent), '/');
    expect(onNavigate).toHaveBeenCalledOnce();
  });
});
