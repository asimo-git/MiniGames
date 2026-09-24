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
      hideDialog();
    });

    dialog.addEventListener('click', (event) => {
      if (event.target === dialog) {
        hideDialog();
      }
    });

    return dialog;
  }

  return {
    get(): HTMLDialogElement {
      element ??= createDialogElement();

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
      element.close();
      element.replaceChildren();
    },
    { once: true },
  );
}
