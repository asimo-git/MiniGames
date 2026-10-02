import { createElement } from '../utils/helpers';

export function createEmptyState(message: string): HTMLElement {
  return createElement('p', {
    className: 'state-empty',
    textContent: message,
  });
}
