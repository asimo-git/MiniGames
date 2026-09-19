import { createMainLayout } from './layouts/main-layout';
import { createHomePage } from './pages/home-page';
import './styles/main.scss';

function createRoot(): HTMLElement {
  const root = document.createElement('div');
  root.id = 'app';
  document.body.append(root);
  return root;
}

function renderApp(root: HTMLElement) {
  const page = createHomePage();
  const layout = createMainLayout(page);

  root.append(layout);
}

const root = createRoot();
renderApp(root);
