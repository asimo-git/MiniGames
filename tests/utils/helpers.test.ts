import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  createElement,
  createImageWithFallback,
  formatCount,
  formatRelativeTime,
  getAvatarLetters,
  getPositiveModule,
} from '../../src/utils/helpers';

describe('createElement', () => {
  it('creates an element of the requested tag with no options', () => {
    const element = createElement('div');

    expect(element).toBeInstanceOf(HTMLDivElement);
    expect(element.className).toBe('');
    expect(element.textContent).toBe('');
  });

  it('applies className when provided', () => {
    const element = createElement('span', { className: 'badge badge--active' });

    expect(element.className).toBe('badge badge--active');
  });

  it('sets textContent when provided, including an empty string', () => {
    const withText = createElement('p', { textContent: 'hello' });
    expect(withText.textContent).toBe('hello');

    const withEmptyText = createElement('p', { textContent: '' });
    expect(withEmptyText.textContent).toBe('');
  });

  it('sets every attribute from the attributes map', () => {
    const element = createElement('img', {
      attributes: { src: '/cat.png', alt: 'A cat', loading: 'lazy' },
    });

    expect(element.getAttribute('src')).toBe('/cat.png');
    expect(element.getAttribute('alt')).toBe('A cat');
    expect(element.getAttribute('loading')).toBe('lazy');
  });

  it('appends children in order', () => {
    const child1 = createElement('li', { textContent: 'first' });
    const child2 = createElement('li', { textContent: 'second' });

    const list = createElement('ul', { children: [child1, child2] });

    expect(list.children).toHaveLength(2);
    expect(list.children[0]).toBe(child1);
    expect(list.children[1]).toBe(child2);
  });

  it('combines className, textContent, attributes and children together', () => {
    const child = createElement('span', { textContent: 'icon' });

    const element = createElement('button', {
      className: 'btn',
      textContent: 'ignored-before-children',
      attributes: { type: 'button', 'aria-pressed': 'false' },
      children: [child],
    });

    expect(element.className).toBe('btn');
    expect(element.getAttribute('type')).toBe('button');
    expect(element.getAttribute('aria-pressed')).toBe('false');
    expect(element.children).toHaveLength(1);
    expect(element.children[0]).toBe(child);
  });
});

describe('createImageWithFallback', () => {
  it('sets src, alt and the default lazy loading attribute', () => {
    const image = createImageWithFallback({ src: '/game.png', alt: 'Game cover' });

    expect(image).toBeInstanceOf(HTMLImageElement);
    expect(image.getAttribute('src')).toBe('/game.png');
    expect(image.getAttribute('alt')).toBe('Game cover');
    expect(image.getAttribute('loading')).toBe('lazy');
  });

  it('honors an explicit loading mode', () => {
    const image = createImageWithFallback({
      src: '/game.png',
      alt: 'Game cover',
      loading: 'eager',
    });

    expect(image.getAttribute('loading')).toBe('eager');
  });

  it('swaps to the fallback image and hides it from a11y tree exactly once on error', () => {
    const image = createImageWithFallback({ src: '/broken.png', alt: 'Broken image' });

    image.dispatchEvent(new Event('error'));

    expect(image.src).toContain('/error-img.png');
    expect(image.alt).toBe('');
    expect(image.getAttribute('aria-hidden')).toBe('true');
  });

  // it('does not loop by re-triggering the fallback (listener is { once: true })', () => {
  //   const image = createImageWithFallback({ src: '/broken.png', alt: 'Broken image' });

  //   image.dispatchEvent(new Event('error'));
  //   const srcAfterFirstError = image.src;

  //   image.dispatchEvent(new Event('error'));

  //   expect(image.src).toBe(srcAfterFirstError);
  // });
});

describe('getAvatarLetters', () => {
  it('returns the first letter uppercased for a single-word nickname', () => {
    expect(getAvatarLetters('mario')).toBe('M');
  });

  it('returns initials from the first two words of a multi-word nickname', () => {
    expect(getAvatarLetters('mario rossi bianchi')).toBe('MR');
  });

  it('collapses repeated whitespace and trims the nickname', () => {
    expect(getAvatarLetters('  mario    rossi  ')).toBe('MR');
  });

  it('supports unicode letters', () => {
    expect(getAvatarLetters('Žan Übel')).toBe('ŽÜ');
  });

  it('falls back to digits when a word has no letters', () => {
    expect(getAvatarLetters('007 agent')).toBe('0A');
  });

  it('skips words that contain no letters or digits at all', () => {
    expect(getAvatarLetters('** mario')).toBe('M');
  });

  it('returns an empty string for an empty or whitespace-only nickname', () => {
    expect(getAvatarLetters('   ')).toBe('');
  });
});

describe('formatCount', () => {
  it('leaves small counts unformatted', () => {
    expect(formatCount(0)).toBe('0');
    expect(formatCount(999)).toBe('999');
  });

  it('compacts thousands with up to one decimal place', () => {
    expect(formatCount(1500)).toBe('1.5K');
    expect(formatCount(1000)).toBe('1K');
  });

  it('compacts millions', () => {
    expect(formatCount(2_300_000)).toBe('2.3M');
  });

  it('formats negative counts with the same compact notation', () => {
    expect(formatCount(-1500)).toBe('-1.5K');
  });
});

describe('getPositiveModule', () => {
  it('matches the native remainder for positive inputs', () => {
    expect(getPositiveModule(7, 3)).toBe(1);
    expect(getPositiveModule(9, 3)).toBe(0);
  });

  it('wraps negative values into the positive range', () => {
    expect(getPositiveModule(-1, 5)).toBe(4);
    expect(getPositiveModule(-5, 5)).toBe(0);
    expect(getPositiveModule(-7, 3)).toBe(2);
  });

  it('is useful for cyclic index wrapping (e.g. carousel navigation)', () => {
    const length = 4;
    expect(getPositiveModule(0 - 1, length)).toBe(3);
    expect(getPositiveModule(3 + 1, length)).toBe(0);
  });
});

describe('formatRelativeTime', () => {
  const NOW = '2026-08-30T12:00:00Z';

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(NOW));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns "just now" for a timestamp under a minute old', () => {
    expect(formatRelativeTime('2026-08-30T11:59:30Z')).toBe('just now');
  });

  it('formats minutes ago', () => {
    expect(formatRelativeTime('2026-08-30T11:05:00Z')).toBe('55 minutes ago');
  });

  it('formats hours ago', () => {
    expect(formatRelativeTime('2026-08-30T01:00:00Z')).toBe('11 hours ago');
  });

  it('formats days ago', () => {
    expect(formatRelativeTime('2026-08-25T12:00:00Z')).toBe('5 days ago');
  });

  it('formats weeks ago', () => {
    expect(formatRelativeTime('2026-08-10T12:00:00Z')).toBe('2 weeks ago');
  });

  it('formats months ago', () => {
    expect(formatRelativeTime('2026-01-15T12:00:00Z')).toBe('7 months ago');
  });

  it('formats years ago', () => {
    expect(formatRelativeTime('2023-08-30T12:00:00Z')).toBe('3 years ago');
  });

  it('returns an empty string for an unparsable date', () => {
    expect(formatRelativeTime('not-a-date')).toBe('');
  });

  it('returns "just now" for a timestamp in the future (negative diff)', () => {
    expect(formatRelativeTime('2026-08-30T12:00:30Z')).toBe('just now');
  });
});
