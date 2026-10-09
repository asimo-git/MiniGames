import { describe, expect, it, vi } from 'vitest';

const { header, footer } = vi.hoisted(() => ({
  header: document.createElement('header'),
  footer: document.createElement('footer'),
}));

vi.mock('../../src/components/header', () => ({ createHeader: () => header }));
vi.mock('../../src/components/footer', () => ({ createFooter: () => footer }));

import { createMainLayout } from '../../src/layouts/main-layout';

describe('createMainLayout', () => {
  it('assembles header, main and footer and returns layout with main', () => {
    const { layout, main } = createMainLayout();

    expect(layout.className).toBe('main-layout');
    expect(main.tagName).toBe('MAIN');
    expect(main.className).toBe('main-layout__main');
    expect([...layout.children]).toEqual([header, main, footer]);
  });
});
