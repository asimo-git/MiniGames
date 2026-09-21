import { createFooter } from '../components/footer';
import { createHeader } from '../components/header';

interface MainLayout {
  layout: HTMLElement;
  main: HTMLElement;
}

export function createMainLayout(): MainLayout {
  const layout = document.createElement('div');
  layout.className = 'main-layout';

  const header = createHeader();

  const main = document.createElement('main');
  main.className = 'main-layout__main';

  const footer = createFooter();

  layout.append(header, main, footer);

  return { layout, main };
}
