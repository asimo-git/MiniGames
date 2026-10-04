import { closeDialog } from '../../router/dialog-router';
import { createElement } from '../../utils/helpers';

interface ShowDialogOptions {
  ariaLabel: string;
}

const dialogElementStore = (() => {
  let element: HTMLDialogElement | undefined;

  function createDialogElement(): HTMLDialogElement {
    const dialog = createElement('dialog', { className: 'dialog-backdrop' });

    document.body.append(dialog);

    dialog.addEventListener('cancel', (event) => {
      event.preventDefault();
      closeDialog();
    });

    dialog.addEventListener('click', (event) => {
      if (event.target === dialog) {
        closeDialog();
      }
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
  };
})();

export function showDialog(content: HTMLElement, { ariaLabel }: ShowDialogOptions): void {
  const element = dialogElementStore.get();

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

  if (!element.open) {
    return;
  }

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
  return dialog?.open ? dialog : document.body;
}
