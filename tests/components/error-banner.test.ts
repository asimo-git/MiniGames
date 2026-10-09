import { describe, expect, it, vi } from 'vitest';
import { createErrorBanner } from '../../src/components/error-banner';

describe('createErrorBanner', () => {
  it('renders a default alert without a retry button', () => {
    const banner = createErrorBanner({ message: 'Failed to load' });

    expect(banner.className).toBe('error-banner error-banner--default');
    expect(banner.getAttribute('role')).toBe('alert');
    expect(banner.querySelector('.error-banner__icon')).not.toBeNull();
    expect(banner.querySelector('.error-banner__message')?.textContent).toBe('Failed to load');
    expect(banner.querySelector('button')).toBeNull();
  });

  it('renders a compact banner with a retry button that calls onRetry', () => {
    const onRetry = vi.fn();
    const banner = createErrorBanner({ message: 'Oops', size: 'compact', onRetry });
    const button = banner.querySelector('button');

    expect(banner.className).toBe('error-banner error-banner--compact');
    expect(button?.textContent).toBe('Try again');
    expect(button?.getAttribute('type')).toBe('button');

    button?.click();

    expect(onRetry).toHaveBeenCalledOnce();
  });
});
