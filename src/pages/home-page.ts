import { createGameDevelopersSection } from '../components/home-page/game-developers-section';
import { createCarouselSection } from '../components/home-page/carousel-section';
import { createHero } from '../components/home-page/hero';
import { createLeaderboardSection } from '../components/home-page/leaderboard-section';

export function createHomePage(): HTMLElement {
  const homePage = document.createElement('div');

  const hero = createHero();
  const carouselSection = createCarouselSection();
  const leaderboardSection = createLeaderboardSection();
  const gameDevelopersSection = createGameDevelopersSection();

  homePage.append(hero, carouselSection, leaderboardSection, gameDevelopersSection);

  return homePage;
}
