import { hideDialog } from '../components/dialogs/dialog-backdrop';
import { openAuthDialog } from '../components/dialogs/auth-dialog/auth-dialog';
import { openGameDetailDialog } from '../components/dialogs/game-detail-dialog/game-detail-dialog';
import { showSnackbar } from '../components/snackbar';
import {
  getRouteState,
  ROUTE_CHANGE_EVENT,
  updateQuery,
  type AuthMode,
  type DialogParametrs,
  type RouteState,
} from './router';
import { getActiveSession } from '../api/login-session';

type DialogTarget =
  { kind: 'game'; slug: string } | { kind: 'auth'; mode: AuthMode } | { kind: 'none' };

export const dialogState: { dialogKey: string | undefined } = { dialogKey: undefined };

function getDialogTarget({ gameId, auth }: RouteState): DialogTarget {
  if (auth) return { kind: 'auth', mode: auth };
  if (gameId) return { kind: 'game', slug: gameId };
  return { kind: 'none' };
}

function getTargetKey(target: DialogTarget): string | undefined {
  switch (target.kind) {
    case 'game': {
      return `game:${target.slug}`;
    }
    case 'auth': {
      return `auth:${target.mode}`;
    }
    case 'none': {
      return undefined;
    }
  }
}

function syncDialog(): void {
  const route = getRouteState();
  const target = getDialogTarget(route);

  if (target.kind === 'auth' && getActiveSession()) {
    updateQuery({ auth: undefined }, { replace: true });
    showSnackbar({ variant: 'info', message: 'You are already logged in' });
    return;
  }

  const key = getTargetKey(target);

  if (key === dialogState.dialogKey) return;
  dialogState.dialogKey = key;

  switch (target.kind) {
    case 'game': {
      openGameDetailDialog(target.slug);
      break;
    }
    case 'auth': {
      openAuthDialog(target.mode);
      break;
    }
    case 'none': {
      hideDialog();
      break;
    }
  }
}

export function initDialogRouter(): void {
  globalThis.addEventListener(ROUTE_CHANGE_EVENT, syncDialog);
  syncDialog(); // initRouter уже отправил событие до подписки; это же покрывает прямой заход по URL
}

///////////////////////////////////////
//functions to be called from buttons
//////////////////////////////////////

export function openDialog(parametrs: DialogParametrs): void {
  const current = getRouteState();

  updateQuery(
    { game: current.gameId, auth: current.auth, ...parametrs },
    { state: { dialog: true } },
  );
}

export function switchDialog(parametrs: DialogParametrs): void {
  const current = getRouteState();
  updateQuery({ game: current.gameId, auth: current.auth, ...parametrs }, { replace: true });
}

export function closeDialog(): void {
  const { auth, gameId } = getRouteState();

  if (auth) {
    updateQuery({ auth: undefined });
    return;
  }

  if (gameId) {
    updateQuery({ game: undefined });
  }
}
