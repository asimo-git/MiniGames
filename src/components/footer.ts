import shareIcon from '../assets/icons/share.svg';
import chatIcon from '../assets/icons/chat.svg';
import rssIcon from '../assets/icons/rss_feed.svg';
import codeIcon from '../assets/icons/code.svg';
import { createElement } from '../utils/helpers';
import { createLogoLink } from './logo-link';

const NAV_COLUMNS: { title: string; links: string[] }[] = [
  { title: 'Explore', links: ['Home', 'Library', 'Categories', 'Tournaments'] },
  { title: 'Company', links: ['About Us', 'Contact', 'Privacy Policy', 'Terms of Service'] },
];

const SOCIAL_ICONS: { label: string; icon: string }[] = [
  { label: 'Share', icon: shareIcon },
  { label: 'Chat', icon: chatIcon },
  { label: 'RSS feed', icon: rssIcon },
];

export function createFooter(): HTMLElement {
  const footer = createElement('footer', { className: 'footer' });

  footer.append(createTopSection(), createBottomSection());

  return footer;
}

function createTopSection(): HTMLElement {
  const top = createElement('div', { className: 'footer__top' });

  top.append(createTextColumn(), createLinkColumns());

  return top;
}

function createTextColumn(): HTMLElement {
  const column = createElement('div', { className: 'footer__promo-col' });

  const logo = createLogoLink('light');

  const description = createElement('p', {
    className: 'footer__description',
    textContent:
      'Take a short break and have fun. Hundreds of curated casual mini-games right in your web browser. No download required.',
  });

  column.append(logo, description);

  return column;
}

function createLinkColumns(): HTMLElement {
  const columns = createElement('div', { className: 'footer__columns' });

  for (const { title, links } of NAV_COLUMNS) {
    columns.append(createLinkColumn(title, links));
  }

  columns.append(createCommunityColumn());

  return columns;
}

function createLinkColumn(title: string, links: string[]): HTMLElement {
  const column = createElement('div', { className: 'footer__column' });

  const heading = createElement('p', { className: 'footer__column-title', textContent: title });
  column.append(heading);

  for (const label of links) {
    const link = createElement('a', {
      className: 'footer__link',
      textContent: label,
      attributes: { href: '#' },
    });
    column.append(link);
  }

  return column;
}

function createCommunityColumn(): HTMLElement {
  const column = createElement('div', { className: 'footer__column' });

  const heading = createElement('p', {
    className: 'footer__column-title',
    textContent: 'Community',
  });
  const socials = createElement('div', { className: 'footer__socials' });

  for (const { label, icon } of SOCIAL_ICONS) {
    socials.append(createSocialIcon(label, icon));
  }

  column.append(heading, socials);

  return column;
}

function createSocialIcon(label: string, icon: string): HTMLElement {
  const link = createElement('a', {
    className: 'footer__social',
    attributes: { href: '#', 'aria-label': label },
  });

  const image = createElement('img', {
    className: 'footer__social-icon',
    attributes: { src: icon, alt: '' },
  });

  link.append(image);

  return link;
}

function createBottomSection(): HTMLElement {
  const bottom = createElement('div', { className: 'footer__bottom' });

  const copyright = createElement('p', {
    textContent: '© 2026 MiniGames. All rights reserved.',
  });

  const rsSchool = createBadgeLink({
    href: 'https://rs.school/courses/short-track',
    label: 'RS School',
    badgeText: 'RS',
    badgeClassName: 'footer__badge--rs',
  });

  const github = createBadgeLink({
    href: 'https://github.com/asimo-git',
    label: '@asimo-git',
    badgeIcon: codeIcon,
    badgeClassName: 'footer__badge--github',
  });

  const designedWithLove = createElement('p', {
    className: 'footer__designed-with-love',
    textContent: 'Designed with love',
  });

  bottom.append(copyright, rsSchool, github, designedWithLove);

  return bottom;
}

function createBadgeLink(options: {
  href: string;
  label: string;
  badgeClassName: string;
  badgeText?: string;
  badgeIcon?: string;
}): HTMLElement {
  const { href, label, badgeClassName, badgeText, badgeIcon } = options;

  const link = createElement('a', {
    className: 'footer__badge-link',
    attributes: { href, target: '_blank' },
  });

  const badge = createElement('span', { className: `footer__badge ${badgeClassName}` });

  if (badgeIcon) {
    const badgeImage = createElement('img', {
      className: 'footer__badge-icon',
      attributes: { src: badgeIcon, alt: '' },
    });
    badge.append(badgeImage);
  } else if (badgeText) {
    badge.textContent = badgeText;
  }

  const text = createElement('span', { textContent: label });

  link.append(badge, text);

  return link;
}
