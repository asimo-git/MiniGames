import { describe, expect, it } from 'vitest';
import { createArraySkeletons, createSkeleton } from '../../src/components/skeleton';

describe('createSkeleton', () => {
  it('renders a hidden div without style by default', () => {
    const element = createSkeleton({});

    expect(element.tagName).toBe('DIV');
    expect(element.className).toBe('skeleton');
    expect(element.getAttribute('aria-hidden')).toBe('true');
    expect(element.hasAttribute('style')).toBe(false);
  });

  it.each([
    { name: 'width only', options: { width: '10px' }, style: 'width: 10px' },
    { name: 'height only', options: { height: '20px' }, style: 'height: 20px' },
    {
      name: 'width and height',
      options: { width: '10px', height: '20px' },
      style: 'width: 10px; height: 20px',
    },
  ])('builds the style from $name', ({ options, style }) => {
    expect(createSkeleton(options).getAttribute('style')).toBe(style);
  });

  it('uses the given tag and appends a custom class', () => {
    const element = createSkeleton({ tag: 'li', className: 'game-card-geometry' });

    expect(element.tagName).toBe('LI');
    expect(element.className).toBe('skeleton game-card-geometry');
  });
});

describe('createArraySkeletons', () => {
  it('returns one skeleton when called without options', () => {
    expect(createArraySkeletons()).toHaveLength(1);
  });

  it('returns count skeletons with the shared options applied to each', () => {
    const elements = createArraySkeletons({ count: 3, tag: 'span', width: '96px' });

    expect(elements).toHaveLength(3);
    for (const element of elements) {
      expect(element.tagName).toBe('SPAN');
      expect(element.getAttribute('style')).toBe('width: 96px');
    }
  });
});
