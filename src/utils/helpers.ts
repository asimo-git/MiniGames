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

// number → one, few, many
function pluralize(n: number, one: string, few: string, many: string): string {
  const module10 = n % 10;
  const module100 = n % 100;
  if (module10 === 1 && module100 !== 11) return one;
  if (module10 >= 2 && module10 <= 4 && (module100 < 12 || module100 > 14)) return few;
  return many;
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
export function formatRelativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  const diffMs = Date.now() - then;

  if (diffMs < 60_000) return 'just now';

  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 60) {
    return `${minutes} ${pluralize(minutes, 'minute', 'minutes', 'minutes')} ago`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours} ${pluralize(hours, 'hour', 'hours', 'hours')} ago`;
  }

  const days = Math.floor(hours / 24);
  if (days < 7) {
    return `${days} ${pluralize(days, 'day', 'days', 'days')} ago`;
  }

  const weeks = Math.floor(days / 7);
  if (days < 30) {
    return `${weeks} ${pluralize(weeks, 'week', 'weeks', 'weeks')} ago`;
  }

  const months = Math.floor(days / 30);
  if (months < 12) {
    return `${months} ${pluralize(months, 'month', 'months', 'months')} ago`;
  }

  const years = Math.floor(days / 365);
  return `${years} ${pluralize(years, 'year', 'years', 'years')} ago`;
}
