export function createNotFoundPage(): HTMLElement {
  const page = document.createElement('div');
  page.textContent = 'Page not found';

  return page;
}
