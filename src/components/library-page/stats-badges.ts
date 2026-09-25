import { createElement, formatCount } from '../../utils/helpers';
import starIcon from '../../assets/icons/star.svg';
import favoriteIcon from '../../assets/icons/heart.svg';

export function createStatsBadges(ratingCount: number, likesCount: number): HTMLElement {
  const createStat = (iconName: string, value: string): HTMLElement => {
    return createElement('div', {
      className: 'card__stat',
      children: [
        createElement('img', {
          className: 'card__icon',
          attributes: { src: iconName, alt: '' },
        }),
        createElement('span', { textContent: value }),
      ],
    });
  };

  const rating = createStat(starIcon, ratingCount.toFixed(1));
  const likes = createStat(favoriteIcon, formatCount(likesCount));

  return createElement('div', { className: 'card__stats', children: [rating, likes] });
}
