import { createElement } from '../../utils/helpers';
import checkIcon from '../../assets/icons/check.svg';
import { updateQuery } from '../../router/router';

const MENU_ID = 'sort-dropdown-menu';

interface SortOption {
  value: string;
  label: string;
}

export const DEFAULT_SORT_OPTION: SortOption = { value: 'rating-desc', label: 'Rating ↓' };

export const SORT_OPTIONS: SortOption[] = [
  { value: 'rating-asc', label: 'Rating ↑' },
  DEFAULT_SORT_OPTION,
  { value: 'name-asc', label: 'Name A→Z' },
  { value: 'name-desc', label: 'Name Z→A' },
];

export function findSortOption(value: string | undefined): SortOption {
  return SORT_OPTIONS.find((option) => option.value === value) ?? DEFAULT_SORT_OPTION;
}

function createTrigger(label: string): HTMLButtonElement {
  return createElement('button', {
    className: 'sort-dropdown__trigger',
    textContent: `Sort by: ${label}`,
    attributes: {
      type: 'button',
      'aria-haspopup': 'true',
      'aria-expanded': 'false',
      'aria-controls': MENU_ID,
    },
  });
}

function createOption(
  option: SortOption,
  isSelected: boolean,
  onSelect: (sortValue: string) => void,
): HTMLButtonElement {
  const button = createElement('button', {
    className: 'sort-dropdown__option',
    attributes: { type: 'button', 'aria-pressed': String(isSelected) },
    children: [
      createElement('img', {
        className: 'sort-dropdown__check',
        attributes: { src: checkIcon, alt: '' },
      }),

      createElement('span', { className: 'sort-dropdown__label', textContent: option.label }),
    ],
  });

  button.addEventListener('click', () => {
    onSelect(option.value);
  });

  return button;
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

export function createSortDropdown(currentSort: string | undefined): HTMLElement {
  const selectedOption = findSortOption(currentSort);
  const trigger = createTrigger(selectedOption.label);

  function selectOption(sortValue: string): void {
    closeMenu();

    if (sortValue !== selectedOption.value) {
      updateQuery({ sort: sortValue, page: 1 });
    }
  }

  const options = SORT_OPTIONS.map((option) =>
    createOption(option, option.value === selectedOption.value, selectOption),
  );
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

  return root;
}
