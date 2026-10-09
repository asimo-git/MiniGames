import { describe, expect, it } from 'vitest';
import { createHero } from '../../../src/components/home-page/hero';

describe('createHero', () => {
  it('renders the title, both text variants and the button', () => {
    const hero = createHero();

    expect(hero.className).toBe('hero');
    expect(hero.querySelector('.hero__card h1.hero__title')?.textContent).toBe(
      'Take a Short Break & Have Fun',
    );
    expect(hero.querySelector('.hero__text-full')?.textContent).toContain('hundreds of curated');
    expect(hero.querySelector('.hero__text-short')?.textContent).toContain('right in your browser');

    const button = hero.querySelector('button.hero__button');
    expect(button?.textContent).toBe('Browse Library');
    expect(button?.getAttribute('type')).toBe('button');
  });
});
