import { createHomePage } from './pages/home-page';
import './styles/main.scss';

function createRoot(): HTMLElement {
  const root = document.createElement('div');
  root.id = 'app';
  document.body.append(root);
  return root;
}

function renderApp(root: HTMLElement) {
  root.append(createHomePage());
}

const root = createRoot();
renderApp(root);
