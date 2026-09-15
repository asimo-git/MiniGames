import { createFooter } from '../components/footer';
import { createHeader } from '../components/header';

export function createMainLayout(content: HTMLElement): HTMLElement {
  const layout = document.createElement('div');
  layout.className = 'main-layout';

  const header = createHeader();

  const main = document.createElement('main');
  main.className = 'main-layout__main';
  main.append(content);

  const footer = createFooter();

  layout.append(header, main, footer);

  return layout;
}
