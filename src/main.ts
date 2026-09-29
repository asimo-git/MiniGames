import { createMainLayout } from './layouts/main-layout';
import { initDialogRouter } from './router/dialog-router';
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
  initDialogRouter();
}

const root = createRoot();
renderApp(root);
