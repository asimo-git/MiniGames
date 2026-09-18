import { ICONS } from '../../utils/icons';
import { createElement } from '../../utils/helpers';
import illustration from '../../assets/images/illustration1.png';

export function createGameDevelopersSection(): HTMLElement {
  return createElement('section', {
    className: 'developers',
    children: [createIllustrationSide(), createCtaCard()],
  });
}

function createIllustrationSide(): HTMLElement {
  return createElement('img', {
    className: 'developers__illustration',
    attributes: {
      src: illustration,
      alt: 'Illustration of a developer desk',
    },
  });
}

function createCtaCard(): HTMLElement {
  return createElement('div', {
    className: 'developers__card',
    children: [
      createElement('h2', {
        className: 'developers__title',
        textContent: 'Are You a Game Developer?',
      }),
      createElement('p', {
        className: 'developers__description',
        textContent:
          "Want to see your game on MiniGames? We're always looking for fun,\nengaging mini games to add to our platform. Submit your game\nand reach thousands of players!",
      }),
      createCtaButton(),
      createElement('p', {
        className: 'developers__contact',
        textContent: 'or contact us at developers@minigames.com',
      }),
    ],
  });
}

function createCtaButton(): HTMLElement {
  return createElement('button', {
    className: 'developers__button',
    textContent: '',
    // attributes: {  role: 'button' },
    children: [
      createUploadIcon(),
      createElement('span', {
        className: 'developers__button-label',
        textContent: 'Submit Form',
      }),
    ],
  });
}

function createUploadIcon(): HTMLElement {
  const icon = createElement('span', {
    className: 'developers__icon',
    attributes: { 'aria-hidden': 'true' },
  });

  icon.innerHTML = ICONS.upload;

  return icon;
}
