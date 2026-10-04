import { hideDialog } from '../components/dialogs/dialog-backdrop';
import { openAuthDialog } from '../components/dialogs/auth-dialog';
import { openGameDetailDialog } from '../components/dialogs/game-detail-dialog';
import {
  getRouteState,
  ROUTE_CHANGE_EVENT,
  updateQuery,
  type AuthMode,
  type DialogParametrs,
  type RouteState,
} from './router';

type DialogTarget =
  { kind: 'game'; slug: string } | { kind: 'auth'; mode: AuthMode } | { kind: 'none' };

export const dialogState: { dialogKey: string | undefined } = { dialogKey: undefined };

function getDialogTarget({ gameId, auth }: RouteState): DialogTarget {
  if (gameId) return { kind: 'game', slug: gameId };
  if (auth) return { kind: 'auth', mode: auth };
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
  const target = getDialogTarget(getRouteState());
  const key = getTargetKey(target);

  if (key === dialogState.dialogKey) return;
  dialogState.dialogKey = key;

  switch (target.kind) {
    case 'game': {
      openGameDetailDialog(target.slug); // здесь slug: string
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
  if (getDialogTarget(getRouteState()).kind === 'none') return;
  updateQuery({ game: undefined, auth: undefined });
}
