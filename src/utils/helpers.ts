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
