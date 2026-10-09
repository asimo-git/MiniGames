import { beforeEach, describe, expect, it, vi } from 'vitest';

const { handleLinkClick } = vi.hoisted(() => ({ handleLinkClick: vi.fn() }));

vi.mock('../../src/router/router', () => ({
  handleLinkClick,
  ROUTE_PATHS: { home: '/' },
}));

import { createNotFoundPage } from '../../src/pages/not-found-page';

describe('createNotFoundPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the code, title, text and home link', () => {
    const page = createNotFoundPage();

    expect(page.className).toBe('not-found-page');
    expect(page.querySelector('.not-found-page__code')?.textContent).toBe('404');
    expect(page.querySelector('.not-found-page__code')?.getAttribute('aria-hidden')).toBe('true');
    expect(page.querySelector('h1')?.textContent).toBe('Page not found');
    expect(page.querySelector('.not-found-page__text')?.textContent).toBe(
      'Requested URL does not exist',
    );

    const link = page.querySelector<HTMLAnchorElement>('a.not-found-page__button');
    expect(link?.textContent).toBe('Return to Home Page');
    expect(link?.getAttribute('href')).toBe('/');
  });

  it('delegates link clicks to the router', () => {
    const page = createNotFoundPage();

    page.querySelector<HTMLAnchorElement>('a')?.click();

    expect(handleLinkClick).toHaveBeenCalledExactlyOnceWith(expect.any(MouseEvent), '/');
  });
});
