import { createElement } from '../utils/helpers';
import logo from '../assets/icons/logo.svg';

export function createLogoLink(color: 'dark' | 'light' = 'dark'): HTMLElement {
  const brand = createElement('a', { className: 'logo-link', attributes: { href: '/' } });
  const icon = createElement('img', {
    className: 'logo-link__icon',
    attributes: { src: logo, alt: 'logo' },
  });
  const title = createElement('p', {
    className: `logo-link__title logo-link__title--${color}`,
    textContent: 'MiniGames',
  });

  brand.append(icon, title);
  return brand;
}
