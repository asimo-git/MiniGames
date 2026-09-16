import gamesData from '../../data/all-games-seed.json';
import { createElement } from '../../utils/helpers';

interface Game {
  slug: string;
  name: string;
  category: string;
  price: string;
  shortDescription: string;
  rating: number;
  likesCount: number;
  cardImage: string;
  featured: boolean;
}

const GAMES: Game[] = gamesData.data;

export function createCarouselSection(): HTMLElement {
  const section = createElement('section', {
    className: 'carousel',
  });

  section.append(createCarouselHeader(), createCarouselSlider());

  return section;
}

function createCarouselHeader(): HTMLElement {
  const header = createElement('div', {
    className: 'carousel__header',
  });

  return header;
}

function createCarouselSlider(): HTMLElement {
  const slider = createElement('div', {
    className: 'carousel__slider',
  });

  console.log(GAMES);
  return slider;
}
