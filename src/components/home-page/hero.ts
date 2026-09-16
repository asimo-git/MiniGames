import { createElement } from '../../utils/helpers';

export function createHero(): HTMLElement {
  const hero = createElement('section', { className: 'hero' });

  hero.append(createHeroCard());

  return hero;
}

function createHeroCard(): HTMLElement {
  const card = createElement('div', { className: 'hero__card' });

  const title = createElement('h1', {
    className: 'hero__title',
    textContent: 'Take a Short Break & Have Fun',
  });

  const description = createElement('p', {
    className: 'hero__text',
    textContent:
      'Discover hundreds of curated casual mini-games. Play instantly in your browser — puzzle, match 3, farm, and board classics.',
  });

  card.append(title, description, createHeroButton());

  return card;
}

function createHeroButton(): HTMLElement {
  return createElement('button', {
    className: 'hero__button',
    textContent: 'Browse Library',
    attributes: { type: 'button' },
  });
}
