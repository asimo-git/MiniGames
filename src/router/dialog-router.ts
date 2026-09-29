import { hideDialog } from '../components/dialogs/dialog-backdrop';
import { openAuthDialog } from '../components/dialogs/auth-dialog';
import { openGameDetailDialog } from '../components/dialogs/game-detail-dialog';
import {
  getRouteState,
  ROUTE_CHANGE_EVENT,
  updateQuery,
  type AuthMode,
  type RouteState,
} from './router';

type DialogParametrs = { game: string } | { auth: AuthMode };
type DialogKey = 'game' | 'login' | 'register' | undefined;

export const dialogState: { dialogKey: string | undefined } = { dialogKey: undefined };

function getDialogKey({ gameId, auth }: RouteState): DialogKey {
  if (gameId) return 'game';
  if (auth === 'login') return 'login';
  if (auth === 'register') return 'register';
  return undefined;
}

function syncDialog(): void {
  const routeState = getRouteState();
  const key = getDialogKey(routeState);

  if (key === dialogState.dialogKey) return;
  dialogState.dialogKey = key;

  switch (key) {
    case 'game': {
      openGameDetailDialog();
      break;
    }
    case 'login': {
      openAuthDialog('login');
      break;
    }
    case 'register': {
      openAuthDialog('register');
      break;
    }
    case undefined: {
      hideDialog();
      break;
    }
  }
}

export function initDialogRouter(): void {
  globalThis.addEventListener(ROUTE_CHANGE_EVENT, syncDialog);
  syncDialog(); // initRouter уже отправил событие до подписки
}

///////////////////////////////////////
//functions to be called from buttons
//////////////////////////////////////

export function openDialog(parametrs: DialogParametrs): void {
  updateQuery({ game: undefined, auth: undefined, ...parametrs }, { state: { dialog: true } });
}

export function switchDialog(parametrs: DialogParametrs): void {
  updateQuery({ game: undefined, auth: undefined, ...parametrs }, { replace: true });
}

export function closeDialog(): void {
  if (globalThis.history.state?.dialog) {
    globalThis.history.back();
  } else {
    updateQuery({ game: undefined, auth: undefined }, { replace: true });
  }
}
