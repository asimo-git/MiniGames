import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ closeDialog: vi.fn() }));

vi.mock('../../../src/router/dialog-router', () => ({ closeDialog: mocks.closeDialog }));

type DialogModule = typeof import('../../../src/components/dialogs/dialog-backdrop');

async function loadModule(): Promise<DialogModule> {
  vi.resetModules();
  return import('../../../src/components/dialogs/dialog-backdrop');
}

const getDialog = (): HTMLDialogElement => document.querySelector('dialog')!;

const press = (key: string): KeyboardEvent => {
  const event = new KeyboardEvent('keydown', { key, cancelable: true });
  document.dispatchEvent(event);
  return event;
};

describe('dialog-backdrop', () => {
  let showModal: ReturnType<typeof vi.fn>;
  let close: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    showModal = vi.fn(function (this: HTMLDialogElement) {
      this.setAttribute('open', '');
    });
    close = vi.fn(function (this: HTMLDialogElement) {
      this.removeAttribute('open');
    });

    HTMLDialogElement.prototype.showModal = showModal as never;
    HTMLDialogElement.prototype.close = close as never;
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
      callback(0);
      return 0;
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    document.body.replaceChildren();
  });

  it('showDialog fills the dialog once, opens it, and getTopLayerHost follows its state', async () => {
    const { showDialog, getTopLayerHost } = await loadModule();
    expect(getTopLayerHost()).toBe(document.body);

    const content = document.createElement('div');
    showDialog(content, { ariaLabel: 'Game details' });
    const dialog = getDialog();

    expect(dialog.className).toContain('dialog-backdrop');
    expect(dialog.getAttribute('aria-label')).toBe('Game details');
    expect(dialog.firstElementChild).toBe(content);
    expect(dialog.classList.contains('dialog-backdrop--visible')).toBe(true);
    expect(getTopLayerHost()).toBe(dialog);

    const next = document.createElement('p');
    showDialog(next, { ariaLabel: 'Other' });
    expect(showModal).toHaveBeenCalledOnce();
    expect(dialog.firstElementChild).toBe(next);
  });

  it('hideDialog fades out, then closes and clears on transitionend', async () => {
    const { showDialog, hideDialog, getTopLayerHost } = await loadModule();
    showDialog(document.createElement('div'), { ariaLabel: 'x' });
    const dialog = getDialog();

    hideDialog();

    expect(dialog.classList.contains('dialog-backdrop--visible')).toBe(false);
    expect(getTopLayerHost()).toBe(document.body);
    expect(close).not.toHaveBeenCalled();

    dialog.dispatchEvent(new Event('transitionend'));

    expect(close).toHaveBeenCalledOnce();
    expect(dialog.children).toHaveLength(0);
  });

  it('hideDialog does nothing when the dialog is not open', async () => {
    const { hideDialog } = await loadModule();

    hideDialog();
    getDialog().dispatchEvent(new Event('transitionend'));

    expect(close).not.toHaveBeenCalled();
  });

  it('does not close on transitionend if the dialog was shown again meanwhile', async () => {
    const { showDialog, hideDialog } = await loadModule();
    const content = document.createElement('div');
    showDialog(content, { ariaLabel: 'x' });
    hideDialog();
    showDialog(content, { ariaLabel: 'x' });

    getDialog().dispatchEvent(new Event('transitionend'));

    expect(close).not.toHaveBeenCalled();
  });

  it('a locked dialog is inert, blocks Escape and cannot be hidden or closed by the user', async () => {
    const { showDialog, hideDialog, setDialogLocked, isDialogLocked } = await loadModule();
    expect(isDialogLocked()).toBe(false);

    showDialog(document.createElement('div'), { ariaLabel: 'x' });
    const dialog = getDialog();

    setDialogLocked(true);

    expect(isDialogLocked()).toBe(true);
    expect(dialog.hasAttribute('data-locked')).toBe(true);
    expect(dialog.inert).toBe(true);
    expect(press('Escape').defaultPrevented).toBe(true);
    expect(press('Enter').defaultPrevented).toBe(false);

    hideDialog();
    expect(dialog.classList.contains('dialog-backdrop--visible')).toBe(true);

    dialog.dispatchEvent(new Event('cancel', { cancelable: true }));
    dialog.dispatchEvent(new MouseEvent('click'));
    expect(mocks.closeDialog).not.toHaveBeenCalled();

    setDialogLocked(false);

    expect(isDialogLocked()).toBe(false);
    expect(dialog.inert).toBe(false);
    expect(press('Escape').defaultPrevented).toBe(false);
  });
});
