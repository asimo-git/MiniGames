import { createElement } from '../utils/helpers';
import backwardIcon from '../assets/icons/chevron_backward.svg';
import forwardIcon from '../assets/icons/chevron_forward.svg';

interface PaginationOptions {
  totalPages: number;
  onPageChange: (pageNumber: number) => void;
}
const DESKTOP_VISIBLE_PAGES = 4;
const MOBILE_VISIBLE_PAGES = 3;
const mobileQuery = globalThis.matchMedia('(max-width: 480px)');

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

export function createPagination({ totalPages, onPageChange }: PaginationOptions): HTMLElement {
  let currentPage = 1;
  let pageButtons: HTMLButtonElement[] = [];

  const previousButton = createArrowButton('Previous page', backwardIcon, () => {
    goToPage(currentPage - 1);
  });
  const nextButton = createArrowButton('Next page', forwardIcon, () => {
    goToPage(currentPage + 1);
  });

  const navigation = createElement('nav', {
    className: 'pagination',
    attributes: { 'aria-label': 'Pagination' },
    children: [previousButton, nextButton],
  });

  function render(): void {
    const visibleCount = getVisibleCount(totalPages);

    if (visibleCount !== pageButtons.length) {
      pageButtons = Array.from({ length: visibleCount }, () => createPageButton(goToPage));
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

  function goToPage(pageNumber: number): void {
    const targetPage = Math.min(Math.max(pageNumber, 1), totalPages);

    if (targetPage === currentPage) {
      return;
    }

    currentPage = targetPage;
    render();
    onPageChange(currentPage);
  }

  mobileQuery.addEventListener('change', render);
  render();

  return navigation;
}
