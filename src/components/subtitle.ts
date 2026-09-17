import { createElement } from '../utils/helpers';

export function createSubtitle(text: string): HTMLElement {
  return createElement('div', {
    className: 'subtitle',
    children: [
      createElement('div', { className: 'subtitle__accent' }),
      createElement('h2', {
        className: 'subtitle__title',
        textContent: text,
      }),
    ],
  });
}
