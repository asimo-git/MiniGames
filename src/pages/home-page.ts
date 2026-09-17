import { createCarouselSection } from '../components/home-page/carousel-section';
import { createHero } from '../components/home-page/hero';
import { createLeaderboardSection } from '../components/home-page/leaderboard-section';

export function createHomePage(): HTMLElement {
  const homePage = document.createElement('main');

  const hero = createHero();
  const carouselSection = createCarouselSection();
  const leaderboardSection = createLeaderboardSection();

  homePage.append(hero, carouselSection, leaderboardSection);

  return homePage;
}
