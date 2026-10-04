import type { CreateElementOptions } from './types';

export function createElement<K extends keyof HTMLElementTagNameMap>(
  tagName: K,
  options: CreateElementOptions = {},
): HTMLElementTagNameMap[K] {
  const element = document.createElement(tagName);

  const { className, textContent, attributes, children } = options;

  if (className) {
    element.className = className;
  }

  if (textContent !== undefined) {
    element.textContent = textContent;
  }

  if (attributes) {
    for (const [name, value] of Object.entries(attributes)) {
      element.setAttribute(name, value);
    }
  }

  if (children) {
    element.append(...children);
  }

  return element;
}

export interface ImageWithFallbackOptions {
  src: string;
  alt: string;
  className?: string;
  loading?: 'lazy' | 'eager';
}

export function createImageWithFallback({
  src,
  alt,
  className,
  loading = 'lazy',
}: ImageWithFallbackOptions): HTMLImageElement {
  const img = createElement('img', {
    className: ['image-with-fallback', className].filter(Boolean).join(' '),
    attributes: { src, alt, loading },
  });

  img.addEventListener(
    'error',
    () => {
      img.src = '/error-img.png';
      img.alt = '';
      img.setAttribute('aria-hidden', 'true');
    },
    { once: true },
  );

  return img;
}

export function getAvatarLetters(nickname: string): string {
  const upperLetters = nickname.match(/[A-Z]/g) || [];

  if (upperLetters.length >= 2) {
    return upperLetters.slice(0, 2).join('').toUpperCase();
  }

  const firstTwo = nickname.slice(0, 2);
  return firstTwo.toUpperCase();
}

const COUNT_FORMATTER = new Intl.NumberFormat('en-US', {
  notation: 'compact',
  maximumFractionDigits: 1,
});

// 1500 → 1.5K
export function formatCount(count: number): string {
  return COUNT_FORMATTER.format(count);
}

export function getPositiveModule(n: number, m: number): number {
  return ((n % m) + m) % m;
}

/**
 * @example
 *   '2026-08-30T11:59:30Z' = > 'just now'
 *   '2026-08-30T11:05:00Z' = > '55 minutes ago'
 *   '2026-08-30T01:00:00Z' = > '11 hours ago'
 *   '2026-08-25T12:00:00Z' = > '5 days ago'
 *   '2026-08-10T12:00:00Z' = > '2 weeks ago'
 *   '2026-01-15T12:00:00Z' = > '7 months ago'
 *   '2023-08-30T12:00:00Z' = > '3 years ago'
 */
const RELATIVE_TIME = new Intl.RelativeTimeFormat('en', { numeric: 'always' });
const UNITS: Array<[Intl.RelativeTimeFormatUnit, number]> = [
  ['year', 360 * 86_400_000],
  ['month', 30 * 86_400_000],
  ['week', 7 * 86_400_000],
  ['day', 86_400_000],
  ['hour', 3_600_000],
  ['minute', 60_000],
];

export function formatRelativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  if (Number.isNaN(diffMs)) return '';
  for (const [unit, ms] of UNITS) {
    if (diffMs >= ms) return RELATIVE_TIME.format(-Math.floor(diffMs / ms), unit);
  }
  return 'just now';
}
