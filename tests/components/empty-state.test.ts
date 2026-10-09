import { describe, expect, it } from 'vitest';
import { createEmptyState } from '../../src/components/empty-state';

describe('createEmptyState', () => {
  it('renders the message in a paragraph', () => {
    const element = createEmptyState('No games found');

    expect(element.tagName).toBe('P');
    expect(element.className).toBe('state-empty');
    expect(element.textContent).toBe('No games found');
  });
});
