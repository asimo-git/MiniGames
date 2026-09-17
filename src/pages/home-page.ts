import { createElement } from '../utils/helpers';
import { createCarouselSection } from '../components/home-page/carousel-section';
import { createHero } from '../components/home-page/hero';

export function createHomePage(): HTMLElement {
  const homePage = document.createElement('main');

  const hero = createHero();
  const carouselSection = createCarouselSection();

  const container = createElement('div', {
    className: `main-container`,
    children: [carouselSection],
  });

  homePage.append(hero, container);

  return homePage;
}
