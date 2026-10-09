import { describe, expect, it } from 'vitest';
import { createLogoLink } from '../../src/components/logo-link';

describe('createLogoLink', () => {
  it.each([
    { name: 'dark by default', args: [] as const, color: 'dark' },
    { name: 'light when requested', args: ['light'] as const, color: 'light' },
  ])('renders a link to the home page, $name', ({ args, color }) => {
    const link = createLogoLink(...args);

    expect(link.tagName).toBe('A');
    expect(link.getAttribute('href')).toBe('/');
    expect(link.querySelector('img')?.getAttribute('alt')).toBe('logo');
    expect(link.querySelector('img')?.getAttribute('src')).toBeTruthy();

    const title = link.querySelector('p');
    expect(title?.textContent).toBe('MiniGames');
    expect(title?.className).toBe(`logo-link__title logo-link__title--${color}`);
  });
});
