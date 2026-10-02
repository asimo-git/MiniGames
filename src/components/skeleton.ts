import { createElement } from '../utils/helpers';

interface SkeletonOptions {
  tag?: keyof HTMLElementTagNameMap;
  width?: string;
  count?: number;
  className?: string;
}

export function createSkeleton(options: SkeletonOptions): HTMLElement[] {
  const { tag = 'div', width, count = 1, className } = options;

  return Array.from({ length: count }, () =>
    createElement(tag, {
      className: `skeleton ${className || ''}`,
      attributes: {
        'aria-hidden': 'true',
        ...(width && { style: `width: ${width}` }),
      },
    }),
  );
}
