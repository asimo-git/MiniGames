import { createElement } from '../utils/helpers';

export type ErrorBannerSize = 'default' | 'compact';

interface ErrorBannerOptions {
  message: string;
  onRetry?: () => void;
  size?: ErrorBannerSize;
}

export function createErrorBanner(options: ErrorBannerOptions): HTMLElement {
  const { message, onRetry, size = 'default' } = options;

  const children: Node[] = [
    createElement('span', { className: 'error-banner__icon' }),
    createElement('p', { className: 'error-banner__message', textContent: message }),
  ];

  if (onRetry) {
    const retryButton = createElement('button', {
      className: 'error-banner__retry',
      textContent: 'Try again',
      attributes: { type: 'button' },
    });

    retryButton.addEventListener('click', onRetry);
    children.push(retryButton);
  }

  return createElement('div', {
    className: `error-banner error-banner--${size}`,
    attributes: { role: 'alert' },
    children,
  });
}
