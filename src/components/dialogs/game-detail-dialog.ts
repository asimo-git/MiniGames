import { GAME_TITLE } from '../../data/game-detail-dialog';
import { createElement } from '../../utils/helpers';
import { showDialog } from './dialog-backdrop';

function createPanel(): HTMLElement {
  return createElement('div', {
    className: 'game-detail-dialog',
    textContent: 'dialog',
  });
}

export function openGameDetailDialog(): void {
  const panel = createPanel();

  showDialog(panel, { ariaLabel: GAME_TITLE });
}
