import { describe, expect, it, vi } from 'vitest';

vi.mock('../../../src/utils/helpers', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../../src/utils/helpers')>()),
  formatCount: (value: number) => `fmt:${value}`,
}));

import { createStatsBadges } from '../../../src/components/library-page/stats-badges';

describe('createStatsBadges', () => {
  it('renders the rating with one decimal and the formatted likes count', () => {
    const badges = createStatsBadges(4.25, 1234);
    const stats = [...badges.querySelectorAll('.card__stat')];

    expect(badges.className).toBe('card__stats');
    expect(stats).toHaveLength(2);
    expect(stats.map((stat) => stat.querySelector('span')?.textContent)).toEqual([
      '4.3',
      'fmt:1234',
    ]);

    for (const stat of stats) {
      const icon = stat.querySelector('img.card__icon');
      expect(icon?.getAttribute('alt')).toBe('');
      expect(icon?.getAttribute('src')).toBeTruthy();
    }
  });
});
