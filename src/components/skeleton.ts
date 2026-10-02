import { createElement } from '../utils/helpers';

interface SkeletonOptions {
  tag?: keyof HTMLElementTagNameMap;
  width?: string;
  height?: string;
  className?: string;
}

interface SkeletonsOptions extends SkeletonOptions {
  count?: number;
}

export function createSkeleton(options: SkeletonOptions): HTMLElement {
  const { tag = 'div', width, height, className } = options;

  const style = [width && `width: ${width}`, height && `height: ${height}`]
    .filter(Boolean)
    .join('; ');

  return createElement(tag, {
    className: ['skeleton', className].filter(Boolean).join(' '),
    attributes: {
      'aria-hidden': 'true',
      ...(style && { style }),
    },
  });
}

export function createArraySkeletons(options: SkeletonsOptions = {}): HTMLElement[] {
  const { count = 1, ...skeletonOptions } = options;
  return Array.from({ length: count }, () => createSkeleton(skeletonOptions));
}
