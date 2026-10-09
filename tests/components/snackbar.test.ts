import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ getTopLayerHost: vi.fn() }));

vi.mock('../../src/components/dialogs/dialog-backdrop', () => ({
  getTopLayerHost: mocks.getTopLayerHost,
}));

async function loadSnackbar() {
  vi.resetModules();
  return import('../../src/components/snackbar');
}

describe('showSnackbar', () => {
  let host: HTMLElement;

  const snackbars = (): HTMLElement[] => [...host.querySelectorAll<HTMLElement>('.snackbar')];

  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
      callback(0);
      return 0;
    });
    host = document.createElement('div');
    document.body.append(host);
    mocks.getTopLayerHost.mockReturnValue(host);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    document.body.replaceChildren();
  });

  it('shows an info snackbar by default, then hides and removes it', async () => {
    const { showSnackbar } = await loadSnackbar();

    showSnackbar({ message: 'Saved' });

    const [element] = snackbars();
    expect(element.parentElement?.className).toBe('snackbar-container');
    expect(element.className).toContain('snackbar--info');
    expect(element.classList.contains('snackbar--visible')).toBe(true);
    expect(element.querySelector('.snackbar__icon')?.textContent).toBe('i');
    expect(element.querySelector('.snackbar__message')?.textContent).toBe('Saved');
    expect(element.querySelector('.snackbar__close')?.getAttribute('aria-label')).toBe(
      'Close notification',
    );

    vi.advanceTimersByTime(2999);
    expect(element.classList.contains('snackbar--visible')).toBe(true);

    vi.advanceTimersByTime(1);
    expect(element.classList.contains('snackbar--visible')).toBe(false);
    expect(element.isConnected).toBe(true);

    vi.advanceTimersByTime(200);
    expect(element.isConnected).toBe(false);
  });

  it('groups identical messages into one with a counter and restarts the timer', async () => {
    const { showSnackbar } = await loadSnackbar();

    showSnackbar({ message: 'Oops', variant: 'error' });
    vi.advanceTimersByTime(2000);
    showSnackbar({ message: 'Oops', variant: 'error' });
    showSnackbar({ message: 'Oops', variant: 'error' });

    expect(snackbars()).toHaveLength(1);
    expect(snackbars()[0].querySelector('.snackbar__icon')?.textContent).toBe('✕');
    expect(snackbars()[0].querySelector('.snackbar__message')?.textContent).toBe('Oops (3)');

    vi.advanceTimersByTime(2999);
    expect(snackbars()[0].classList.contains('snackbar--visible')).toBe(true);

    vi.advanceTimersByTime(1 + 200);
    expect(snackbars()).toHaveLength(0);
  });

  it('does not throw when the message node is missing on a repeated call', async () => {
    const { showSnackbar } = await loadSnackbar();

    showSnackbar({ message: 'Hi' });
    snackbars()[0].querySelector('.snackbar__message')?.remove();

    expect(() => showSnackbar({ message: 'Hi' })).not.toThrow();
  });

  it('creates a new snackbar if the previous one was removed from the DOM', async () => {
    const { showSnackbar } = await loadSnackbar();

    showSnackbar({ message: 'Hi' });
    const first = snackbars()[0];
    first.remove();
    showSnackbar({ message: 'Hi' });

    expect(snackbars()).toHaveLength(1);
    expect(snackbars()[0]).not.toBe(first);
    expect(snackbars()[0].querySelector('.snackbar__message')?.textContent).toBe('Hi');
  });

  it('close button cancels the pending auto-dismiss timer', async () => {
    const { showSnackbar } = await loadSnackbar();

    showSnackbar({ message: 'Bye' });
    const [element] = snackbars();
    element.querySelector<HTMLButtonElement>('.snackbar__close')?.click();
    vi.advanceTimersByTime(200);
    expect(element.isConnected).toBe(false);

    showSnackbar({ message: 'Bye' });
    expect(snackbars()).toHaveLength(1);
  });

  it('moves the container when the top-layer host changes', async () => {
    const { showSnackbar } = await loadSnackbar();
    const otherHost = document.createElement('div');
    document.body.append(otherHost);

    showSnackbar({ message: 'One' });
    mocks.getTopLayerHost.mockReturnValue(otherHost);
    showSnackbar({ message: 'Two' });

    expect(host.querySelector('.snackbar-container')).toBeNull();
    expect(otherHost.querySelectorAll('.snackbar')).toHaveLength(2);
  });
});
