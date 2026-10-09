import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  getRouteState: vi.fn(),
  updateQuery: vi.fn(),
  getActiveSession: vi.fn(),
  hideDialog: vi.fn(),
  openAuthDialog: vi.fn(),
  openGameDetailDialog: vi.fn(),
  showSnackbar: vi.fn(),
}));

vi.mock('../../src/router/router', () => ({
  getRouteState: mocks.getRouteState,
  updateQuery: mocks.updateQuery,
  ROUTE_CHANGE_EVENT: 'route-change',
}));
vi.mock('../../src/api/login-session', () => ({ getActiveSession: mocks.getActiveSession }));
vi.mock('../../src/components/dialogs/dialog-backdrop', () => ({ hideDialog: mocks.hideDialog }));
vi.mock('../../src/components/dialogs/auth-dialog/auth-dialog', () => ({
  openAuthDialog: mocks.openAuthDialog,
}));
vi.mock('../../src/components/dialogs/game-detail-dialog/game-detail-dialog', () => ({
  openGameDetailDialog: mocks.openGameDetailDialog,
}));
vi.mock('../../src/components/snackbar', () => ({ showSnackbar: mocks.showSnackbar }));

import {
  closeDialog,
  dialogState,
  initDialogRouter,
  openDialog,
  switchDialog,
} from '../../src/router/dialog-router';

function setRoute(partial: { gameId?: string; auth?: string }): void {
  mocks.getRouteState.mockReturnValue({ path: '/', ...partial });
}

describe('dialog-router', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    dialogState.dialogKey = undefined;
  });

  describe('initDialogRouter', () => {
    it.each([
      {
        name: 'game',
        route: { gameId: 'tetris' },
        from: undefined,
        mock: 'openGameDetailDialog',
        args: ['tetris'],
      },
      {
        name: 'auth',
        route: { auth: 'login' },
        from: undefined,
        mock: 'openAuthDialog',
        args: ['login'],
      },
      { name: 'none', route: {}, from: 'game:tetris', mock: 'hideDialog', args: [] },
    ])('opens the right dialog for $name', ({ route, from, mock, args }) => {
      dialogState.dialogKey = from;
      setRoute(route);

      initDialogRouter();

      expect(mocks[mock as keyof typeof mocks]).toHaveBeenCalledExactlyOnceWith(...args);
    });

    it('does nothing when the dialog key has not changed', () => {
      dialogState.dialogKey = 'game:tetris';
      setRoute({ gameId: 'tetris' });

      initDialogRouter();

      expect(mocks.openGameDetailDialog).not.toHaveBeenCalled();
    });

    it('redirects away from auth when already logged in', () => {
      mocks.getActiveSession.mockReturnValue({ user: 'ann' });
      setRoute({ auth: 'login' });

      initDialogRouter();

      expect(mocks.updateQuery).toHaveBeenCalledWith({ auth: undefined }, { replace: true });
      expect(mocks.showSnackbar).toHaveBeenCalledWith({
        variant: 'info',
        message: 'You are already logged in',
      });
      expect(mocks.openAuthDialog).not.toHaveBeenCalled();
    });

    it('syncs again on route-change event', () => {
      const addListener = vi.spyOn(globalThis, 'addEventListener').mockImplementation(() => {});
      setRoute({ gameId: 'a' });
      initDialogRouter();

      setRoute({ gameId: 'b' });
      const [type, handler] = addListener.mock.calls[0] as [string, () => void];
      handler();

      expect(type).toBe('route-change');
      expect(mocks.openGameDetailDialog).toHaveBeenLastCalledWith('b');
      addListener.mockRestore();
    });
  });

  describe('openDialog / switchDialog', () => {
    beforeEach(() => setRoute({ gameId: 'g' }));

    it('openDialog pushes the merged query with dialog state', () => {
      openDialog({ auth: 'login' });

      expect(mocks.updateQuery).toHaveBeenCalledWith(
        { game: 'g', auth: 'login' },
        { state: { dialog: true } },
      );
    });

    it('switchDialog replaces the merged query', () => {
      switchDialog({ game: 'x' });

      expect(mocks.updateQuery).toHaveBeenCalledWith(
        { game: 'x', auth: undefined },
        { replace: true },
      );
    });
  });

  describe('closeDialog', () => {
    it.each([
      { name: 'auth', route: { auth: 'login', gameId: 'g' }, expected: { auth: undefined } },
      { name: 'game', route: { gameId: 'g' }, expected: { game: undefined } },
    ])('closes the $name dialog', ({ route, expected }) => {
      setRoute(route);

      closeDialog();

      expect(mocks.updateQuery).toHaveBeenCalledExactlyOnceWith(expected);
    });

    it('does nothing when no dialog is open', () => {
      setRoute({});

      closeDialog();

      expect(mocks.updateQuery).not.toHaveBeenCalled();
    });
  });
});
