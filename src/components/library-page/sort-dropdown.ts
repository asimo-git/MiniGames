import { createElement } from '../../utils/helpers';
import checkIcon from '../../assets/icons/check.svg';
import { SORT_OPTIONS, DEFAULT_SORT_OPTION } from '../../data/filter-sort-config';

const MENU_ID = 'sort-dropdown-menu';

function createTrigger(): HTMLButtonElement {
  return createElement('button', {
    className: 'sort-dropdown__trigger',
    textContent: `Sort by: ${DEFAULT_SORT_OPTION}`,
    attributes: {
      type: 'button',
      'aria-haspopup': 'true',
      'aria-expanded': 'false',
      'aria-controls': MENU_ID,
    },
  });
}

function createOption(label: string, isSelected: boolean): HTMLButtonElement {
  return createElement('button', {
    className: 'sort-dropdown__option',
    attributes: { type: 'button', 'aria-pressed': String(isSelected), 'data-label': label },
    children: [
      createElement('img', {
        className: 'sort-dropdown__check',
        attributes: { src: checkIcon, alt: '' },
      }),

      createElement('span', { className: 'sort-dropdown__label', textContent: label }),
    ],
  });
}

function createMenu(options: HTMLButtonElement[]): HTMLElement {
  const items = options.map((option) =>
    createElement('li', { className: 'sort-dropdown__item', children: [option] }),
  );
  const menu = createElement('ul', {
    className: 'sort-dropdown__menu',
    attributes: { id: MENU_ID },
    children: items,
  });

  menu.hidden = true;

  return menu;
}

function selectOption(options: HTMLButtonElement[], selectedOption: HTMLButtonElement): void {
  for (const option of options) {
    option.setAttribute('aria-pressed', String(option === selectedOption));
  }
}

export function createSortDropdown(): HTMLElement {
  const trigger = createTrigger();
  const options = SORT_OPTIONS.map((label) => createOption(label, label === DEFAULT_SORT_OPTION));
  const menu = createMenu(options);
  const root = createElement('div', { className: 'sort-dropdown', children: [trigger, menu] });

  function handleDocumentClick(event: MouseEvent): void {
    if (event.target instanceof Node && !root.contains(event.target)) {
      closeMenu();
    }
  }

  function handleDocumentKeydown(event: KeyboardEvent): void {
    if (event.key !== 'Escape') {
      return;
    }

    closeMenu();
    trigger.focus();
  }

  function openMenu(): void {
    menu.hidden = false;
    trigger.setAttribute('aria-expanded', 'true');
    document.addEventListener('click', handleDocumentClick);
    document.addEventListener('keydown', handleDocumentKeydown);
  }

  function closeMenu(): void {
    menu.hidden = true;
    trigger.setAttribute('aria-expanded', 'false');
    document.removeEventListener('click', handleDocumentClick);
    document.removeEventListener('keydown', handleDocumentKeydown);
  }

  trigger.addEventListener('click', () => {
    if (menu.hidden) {
      openMenu();
    } else {
      closeMenu();
    }
  });

  for (const option of options) {
    option.addEventListener('click', () => {
      selectOption(options, option);
      trigger.textContent = `Sort by: ${option.dataset.label}`;
      closeMenu();
    });
  }

  return root;
}
