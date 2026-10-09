import { describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  createLogoLink: vi.fn(() => document.createElement('a')),
  createNavLinksComponent: vi.fn(),
}));

vi.mock('../../src/components/logo-link', () => ({ createLogoLink: mocks.createLogoLink }));
vi.mock('../../src/components/nav-links-component', () => ({
  createNavLinksComponent: mocks.createNavLinksComponent,
}));

import { createFooter } from '../../src/components/footer';

describe('createFooter', () => {
  it('renders promo, link columns, socials and bottom badges', () => {
    const footer = createFooter();

    expect(footer.tagName).toBe('FOOTER');
    expect(mocks.createLogoLink).toHaveBeenCalledWith('light');

    // верхняя часть
    expect(footer.querySelector('.footer__description')?.textContent).toContain('mini-games');
    const titles = [...footer.querySelectorAll('.footer__column-title')].map((t) => t.textContent);
    expect(titles).toEqual(['Explore', 'Company', 'Community']);

    const nav = footer.querySelector('nav.footer__column-links');
    expect(mocks.createNavLinksComponent).toHaveBeenCalledWith(nav, {
      linkClassName: 'footer__link',
      activeLinkClassName: 'footer__link--active',
    });

    const companyLinks = [...footer.querySelectorAll('a.footer__link')].map((a) => a.textContent);
    expect(companyLinks).toEqual(['About Us', 'Contact', 'Privacy Policy', 'Terms of Service']);

    const socials = [...footer.querySelectorAll('a.footer__social')];
    expect(socials.map((a) => a.getAttribute('aria-label'))).toEqual(['Share', 'Chat', 'RSS feed']);
    expect(footer.querySelectorAll('img.footer__social-icon')).toHaveLength(3);

    // нижняя часть
    const bottom = footer.querySelector('.footer__bottom');
    expect(bottom?.querySelector('p')?.textContent).toBe('© 2026 MiniGames. All rights reserved.');
    expect(bottom?.querySelector('.footer__designed-with-love')?.textContent).toBe(
      'Designed with love',
    );

    const [rsSchool, github] = [...footer.querySelectorAll('a.footer__badge-link')];
    expect(rsSchool.getAttribute('href')).toBe('https://rs.school/courses/short-track');
    expect(rsSchool.getAttribute('target')).toBe('_blank');
    expect(rsSchool.querySelector('.footer__badge--rs')?.textContent).toBe('RS');
    expect(rsSchool.querySelector('img')).toBeNull();
    expect(github.getAttribute('href')).toBe('https://github.com/asimo-git');
    expect(github.querySelector('.footer__badge--github img.footer__badge-icon')).not.toBeNull();
    expect(github.textContent).toBe('@asimo-git');
  });
});
