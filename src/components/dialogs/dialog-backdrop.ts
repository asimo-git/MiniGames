import { closeDialog } from '../../router/dialog-router';
import { createElement } from '../../utils/helpers';

interface ShowDialogOptions {
  ariaLabel: string;
}

const LOCKED_ATTRIBUTE = 'data-locked';

const dialogElementStore = (() => {
  let element: HTMLDialogElement | undefined;
  let isClosed = false;

  function createDialogElement(): HTMLDialogElement {
    const dialog = createElement('dialog', { className: 'dialog-backdrop' });

    document.body.append(dialog);

    dialog.addEventListener('cancel', (event) => {
      event.preventDefault();

      if (isDialogLocked()) {
        return;
      }

      closeDialog();
    });

    dialog.addEventListener('click', (event) => {
      if (event.target !== dialog) {
        return;
      }

      if (isDialogLocked()) {
        return;
      }

      closeDialog();
    });

    return dialog;
  }

  return {
    get(): HTMLDialogElement {
      element ??= createDialogElement();
      return element;
    },
    peek(): HTMLDialogElement | undefined {
      return element;
    },
    isClosing(): boolean {
      return isClosed;
    },
    setClosing(shouldClose: boolean): void {
      isClosed = shouldClose;
    },
  };
})();

function blockEscape(event: KeyboardEvent): void {
  if (event.key === 'Escape') {
    event.preventDefault();
  }
}

export function setDialogLocked(isLocked: boolean): void {
  const element = dialogElementStore.get();
  element.toggleAttribute(LOCKED_ATTRIBUTE, isLocked);
  element.inert = isLocked;

  if (isLocked) {
    document.addEventListener('keydown', blockEscape, { capture: true });
  } else {
    document.removeEventListener('keydown', blockEscape, { capture: true });
  }
}

export function isDialogLocked(): boolean {
  const element = dialogElementStore.peek();
  return element?.hasAttribute(LOCKED_ATTRIBUTE) ?? false;
}

export function showDialog(content: HTMLElement, { ariaLabel }: ShowDialogOptions): void {
  const element = dialogElementStore.get();

  dialogElementStore.setClosing(false);

  element.replaceChildren(content);
  element.setAttribute('aria-label', ariaLabel);

  if (!element.open) {
    element.showModal();
  }

  requestAnimationFrame(() => {
    element.classList.add('dialog-backdrop--visible');
  });
}

export function hideDialog(): void {
  const element = dialogElementStore.get();

  if (!element.open || isDialogLocked()) {
    return;
  }

  dialogElementStore.setClosing(true);

  element.classList.remove('dialog-backdrop--visible');

  element.addEventListener(
    'transitionend',
    () => {
      if (element.classList.contains('dialog-backdrop--visible')) return;
      element.close();
      element.replaceChildren();
    },
    { once: true },
  );
}

export function getTopLayerHost(): HTMLElement {
  const dialog = dialogElementStore.peek();

  return !dialogElementStore.isClosing() && dialog?.open ? dialog : document.body;
}
