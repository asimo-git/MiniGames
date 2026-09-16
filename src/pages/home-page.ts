import { createHero } from '../components/home-page/hero';

export function createHomePage(): HTMLElement {
  const homePage = document.createElement('main');

  const hero = createHero();

  homePage.append(hero);

  return homePage;
}
