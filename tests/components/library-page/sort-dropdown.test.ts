import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ updateQuery: vi.fn() }));

vi.mock('../../../src/router/router', () => ({ updateQuery: mocks.updateQuery }));

import {
  createSortDropdown,
  DEFAULT_SORT_OPTION,
  findSortOption,
  SORT_OPTIONS,
} from '../../../src/components/library-page/sort-dropdown';

function setup(currentSort?: string) {
  const root = createSortDropdown(currentSort);
  document.body.append(root);

  return {
    root,
    trigger: root.querySelector<HTMLButtonElement>('.sort-dropdown__trigger')!,
    menu: root.querySelector<HTMLElement>('.sort-dropdown__menu')!,
    options: [...root.querySelectorAll<HTMLButtonElement>('.sort-dropdown__option')],
  };
}

const press = (key: string): void => {
  document.dispatchEvent(new KeyboardEvent('keydown', { key }));
};

describe('findSortOption', () => {
  it('finds a known option and falls back to the default for unknown or missing values', () => {
    expect(findSortOption('name-asc')).toBe(SORT_OPTIONS[2]);
    expect(findSortOption('nope')).toBe(DEFAULT_SORT_OPTION);
    expect(findSortOption(undefined)).toBe(DEFAULT_SORT_OPTION);
  });
});

describe('createSortDropdown', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    document.body.replaceChildren();
  });

  it('renders a closed menu with the current option selected', () => {
    const { trigger, menu, options } = setup('name-asc');

    expect(trigger.textContent).toBe('Sort by: Name A→Z');
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(menu.hidden).toBe(true);
    expect(options.map((o) => o.textContent)).toEqual(SORT_OPTIONS.map((o) => o.label));
    expect(options.map((o) => o.getAttribute('aria-pressed'))).toEqual([
      'false',
      'false',
      'true',
      'false',
    ]);
  });

  it('uses the default option when no sort is given', () => {
    expect(setup().trigger.textContent).toBe(`Sort by: ${DEFAULT_SORT_OPTION.label}`);
  });

  it('toggles the menu with the trigger', () => {
    const { trigger, menu } = setup();

    trigger.click();
    expect(menu.hidden).toBe(false);
    expect(trigger.getAttribute('aria-expanded')).toBe('true');

    trigger.click();
    expect(menu.hidden).toBe(true);
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
  });

  it('closes on an outside click but not on a click inside', () => {
    const { trigger, menu } = setup();
    trigger.click();

    menu.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(menu.hidden).toBe(false);

    document.body.click();
    expect(menu.hidden).toBe(true);
  });

  it('selecting a different option closes the menu and updates the query', () => {
    const { trigger, menu, options } = setup('rating-desc');
    trigger.click();

    options[2].click();

    expect(menu.hidden).toBe(true);
    expect(mocks.updateQuery).toHaveBeenCalledExactlyOnceWith({ sort: 'name-asc', page: 1 });
  });
});
