import { describe, expect, it, vi } from 'vitest';

vi.mock('../../../src/utils/icons', () => ({ ICONS: { upload: '<svg id="upload"></svg>' } }));

import { createGameDevelopersSection } from '../../../src/components/home-page/game-developers-section';

describe('createGameDevelopersSection', () => {
  it('renders the illustration and the call-to-action card', () => {
    const section = createGameDevelopersSection();
    const image = section.querySelector('img.developers__illustration');
    const button = section.querySelector('button.developers__button');
    const icon = button?.querySelector('.developers__icon');

    expect(section.className).toBe('developers');
    expect(image?.getAttribute('alt')).toBe('Illustration of a developer desk');
    expect(image?.getAttribute('src')).toBeTruthy();
    expect(section.querySelector('h2.developers__title')?.textContent).toBe(
      'Are You a Game Developer?',
    );
    expect(section.querySelector('.developers__description')?.textContent).toContain(
      'reach thousands of players',
    );
    expect(button?.querySelector('.developers__button-label')?.textContent).toBe('Submit Form');
    expect(icon?.innerHTML).toBe('<svg id="upload"></svg>');
    expect(section.querySelector('.developers__contact')?.textContent).toBe(
      'or contact us at developers@minigames.com',
    );
  });
});
