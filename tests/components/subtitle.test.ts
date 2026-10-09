import { describe, expect, it } from 'vitest';
import { createSubtitle } from '../../src/components/subtitle';

describe('createSubtitle', () => {
  it('renders the accent and the heading with the text', () => {
    const element = createSubtitle('Top players');

    expect(element.className).toBe('subtitle');
    expect(element.querySelector('.subtitle__accent')).not.toBeNull();
    expect(element.querySelector('h2.subtitle__title')?.textContent).toBe('Top players');
  });
});
