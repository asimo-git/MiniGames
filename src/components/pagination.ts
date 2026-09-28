import { createElement } from '../utils/helpers';
import backwardIcon from '../assets/icons/chevron_backward.svg';
import forwardIcon from '../assets/icons/chevron_forward.svg';
import { updateQuery } from '../router/router';

interface PaginationOptions {
  currentPage: number;
  totalPages: number;
}

const PAGINATION_CLASS = 'pagination';
const DESKTOP_VISIBLE_PAGES = 4;
const MOBILE_VISIBLE_PAGES = 3;
const mobileQuery = globalThis.matchMedia('(max-width: 480px)');

const renderers = new WeakMap<HTMLElement, () => void>();
const subscription = { isActive: false };

function renderAttachedPaginations(): void {
  for (const navigation of document.querySelectorAll<HTMLElement>(`.${PAGINATION_CLASS}`)) {
    renderers.get(navigation)?.();
  }
}

function subscribeToViewportChanges(): void {
  if (subscription.isActive) {
    return;
  }

  subscription.isActive = true;
  mobileQuery.addEventListener('change', renderAttachedPaginations);
}

function createPageButton(onSelect: (pageNumber: number) => void): HTMLButtonElement {
  const button = createElement('button', {
    className: 'pagination__button',
    attributes: { type: 'button' },
  });

  button.addEventListener('click', () => {
    onSelect(Number(button.dataset.page));
  });

  return button;
}

function createArrowButton(label: string, iconUrl: string, onClick: () => void): HTMLButtonElement {
  const button = createElement('button', {
    className: 'pagination__button',
    attributes: { type: 'button', 'aria-label': label },
    children: [
      createElement('img', {
        className: 'pagination__icon',
        attributes: { src: iconUrl, alt: '' },
      }),
    ],
  });

  button.addEventListener('click', onClick);

  return button;
}

function updatePageButton(button: HTMLButtonElement, pageNumber: number, isCurrent: boolean): void {
  button.dataset.page = String(pageNumber);
  button.textContent = String(pageNumber);
  button.setAttribute('aria-label', `Page ${pageNumber}`);
  button.setAttribute('aria-current', isCurrent ? 'page' : 'false');
  button.classList.toggle('pagination__button--active', isCurrent);
}

function getFirstVisiblePage(
  currentPage: number,
  totalPages: number,
  visibleCount: number,
): number {
  const lastPossibleStart = totalPages - visibleCount + 1;

  return Math.max(1, Math.min(currentPage, lastPossibleStart));
}

function getVisibleCount(totalPages: number): number {
  const maxForViewport = mobileQuery.matches ? MOBILE_VISIBLE_PAGES : DESKTOP_VISIBLE_PAGES;

  return Math.min(maxForViewport, totalPages);
}

export function createPagination({ currentPage, totalPages }: PaginationOptions): HTMLElement {
  let pageButtons: HTMLButtonElement[] = [];

  function selectPage(pageNumber: number): void {
    if (!currentPage || pageNumber === currentPage || pageNumber < 1 || pageNumber > totalPages) {
      return;
    }

    updateQuery({ page: pageNumber });
  }

  const previousButton = createArrowButton('Previous page', backwardIcon, () => {
    selectPage(currentPage - 1);
  });
  const nextButton = createArrowButton('Next page', forwardIcon, () => {
    selectPage(currentPage + 1);
  });

  const navigation = createElement('nav', {
    className: PAGINATION_CLASS,
    attributes: { 'aria-label': 'Pagination' },
    children: [previousButton, nextButton],
  });

  function render(): void {
    const visibleCount = getVisibleCount(totalPages);

    if (visibleCount !== pageButtons.length) {
      pageButtons = Array.from({ length: visibleCount }, () => createPageButton(selectPage));
      navigation.replaceChildren(previousButton, ...pageButtons, nextButton);
    }

    const firstVisiblePage = getFirstVisiblePage(currentPage, totalPages, visibleCount);

    for (const [index, button] of pageButtons.entries()) {
      const pageNumber = firstVisiblePage + index;

      updatePageButton(button, pageNumber, pageNumber === currentPage);
    }

    previousButton.disabled = currentPage <= 1;
    nextButton.disabled = currentPage >= totalPages;
  }

  subscribeToViewportChanges();
  renderers.set(navigation, render);
  render();

  return navigation;
}
