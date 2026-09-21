import { createMainLayout } from './layouts/main-layout';
import { initRouter } from './router/router';
import './styles/main.scss';

function createRoot(): HTMLElement {
  const root = document.createElement('div');
  root.id = 'app';
  document.body.append(root);
  return root;
}

function renderApp(root: HTMLElement): void {
  const { layout, main } = createMainLayout();

  root.append(layout);

  initRouter(main);
}

const root = createRoot();
renderApp(root);
