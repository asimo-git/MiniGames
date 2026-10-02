import { createElement } from '../utils/helpers';
import { getTopLayerHost } from './dialogs/dialog-backdrop';

export type SnackbarVariant = 'success' | 'error' | 'warning' | 'info';

export interface SnackbarOptions {
  message: string;
  variant?: SnackbarVariant;
  duration?: number;
}

interface ActiveSnackbar {
  element: HTMLElement;
  count: number;
  timeoutId?: ReturnType<typeof setTimeout>;
}

const DEFAULT_DURATION_MS = 0;
const EXIT_ANIMATION_MS = 200;

const VARIANT_ICON: Record<SnackbarVariant, string> = {
  success: '✓',
  error: '✕',
  warning: '!',
  info: 'i',
};

const container: { element: HTMLElement | undefined } = { element: undefined };

const activeSnackbars = new Map<string, ActiveSnackbar>();

export function showSnackbar({
  message,
  variant = 'info',
  duration = DEFAULT_DURATION_MS,
}: SnackbarOptions): void {
  const key = `${variant}:${message}`;
  const existing = activeSnackbars.get(key);

  if (existing) {
    existing.count += 1;
    updateSnackbarMessage(existing.element, message, existing.count);
    restartTimer(key, existing, duration);
    return;
  }

  const snackbar = createSnackbarElement(message, variant);
  const entry: ActiveSnackbar = { element: snackbar, count: 1 };

  activeSnackbars.set(key, entry);
  getContainer().append(snackbar);

  requestAnimationFrame(() => {
    snackbar.classList.add('snackbar--visible');
  });

  restartTimer(key, entry, duration);

  const closeButton = snackbar.querySelector<HTMLButtonElement>('.snackbar__close');
  closeButton?.addEventListener('click', () => {
    if (entry.timeoutId) globalThis.clearTimeout(entry.timeoutId);
    dismiss(key, entry);
  });
}

function getContainer(): HTMLElement {
  container.element ??= createElement('div', { className: 'snackbar-container' });

  const host = getTopLayerHost();
  if (container.element.parentElement !== host) {
    host.append(container.element);
  }

  return container.element;
}

function restartTimer(key: string, entry: ActiveSnackbar, duration: number): void {
  if (entry.timeoutId) globalThis.clearTimeout(entry.timeoutId);

  if (duration > 0) {
    entry.timeoutId = globalThis.setTimeout(() => dismiss(key, entry), duration);
  }
}

function updateSnackbarMessage(element: HTMLElement, message: string, count: number): void {
  const text = element.querySelector<HTMLParagraphElement>('.snackbar__message');
  if (text) text.textContent = count > 1 ? `${message} (${count})` : message;
}

function createSnackbarElement(message: string, variant: SnackbarVariant): HTMLElement {
  const icon = createElement('span', {
    className: 'snackbar__icon',
    textContent: VARIANT_ICON[variant],
    attributes: { 'aria-hidden': 'true' },
  });

  const text = createElement('p', {
    className: 'snackbar__message',
    textContent: message,
  });

  const closeButton = createElement('button', {
    className: 'snackbar__close',
    textContent: '×',
    attributes: { type: 'button', 'aria-label': 'Close notification' },
  });

  return createElement('div', {
    className: `snackbar snackbar--${variant}`,
    children: [icon, text, closeButton],
  });
}

function dismiss(key: string, entry: ActiveSnackbar): void {
  activeSnackbars.delete(key);
  entry.element.classList.remove('snackbar--visible');
  globalThis.setTimeout(() => entry.element.remove(), EXIT_ANIMATION_MS);
}
