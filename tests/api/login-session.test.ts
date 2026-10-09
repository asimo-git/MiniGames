import type { User } from 'firebase/auth';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../src/api/firebase', () => ({ signOutUser: vi.fn() }));
vi.mock('../../src/components/snackbar', () => ({ showSnackbar: vi.fn() }));

import { signOutUser } from '../../src/api/firebase';
import {
  endSession,
  getActiveSession,
  saveSession,
  SESSION_CHANGED_EVENT,
  SESSION_KEY,
  SESSION_LIFETIME_MS,
} from '../../src/api/login-session';
import { showSnackbar } from '../../src/components/snackbar';

function storeSession(overrides: Record<string, unknown> = {}): void {
  localStorage.setItem(
    SESSION_KEY,
    JSON.stringify({
      displayName: 'Ann',
      email: 'a@b.c',
      authenticatedAt: Date.now(),
      ...overrides,
    }),
  );
}

describe('login-session', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    vi.mocked(signOutUser).mockResolvedValue(undefined);
  });

  describe('saveSession', () => {
    it('stores the session with avatar and dispatches the change event', () => {
      const listener = vi.fn();
      globalThis.addEventListener(SESSION_CHANGED_EVENT, listener);

      saveSession({ displayName: 'Ann', email: 'a@b.c', photoURL: 'http://img' } as User);

      expect(JSON.parse(localStorage.getItem(SESSION_KEY) as string)).toMatchObject({
        displayName: 'Ann',
        email: 'a@b.c',
        avatarUrl: 'http://img',
      });
      expect(listener).toHaveBeenCalledOnce();
      globalThis.removeEventListener(SESSION_CHANGED_EVENT, listener);
    });

    it('falls back to empty strings and omits avatarUrl without a photo', () => {
      saveSession({ displayName: null, email: null, photoURL: null } as User);

      const saved = JSON.parse(localStorage.getItem(SESSION_KEY) as string);
      expect(saved).toMatchObject({ displayName: '', email: '' });
      expect(saved).not.toHaveProperty('avatarUrl');
    });
  });

  describe('getActiveSession', () => {
    it('returns undefined when nothing is stored', () => {
      expect(getActiveSession()).toBeUndefined();
    });

    it('returns a valid session, including avatarUrl when present', () => {
      storeSession({ avatarUrl: 'http://img' });

      expect(getActiveSession()).toMatchObject({
        displayName: 'Ann',
        email: 'a@b.c',
        avatarUrl: 'http://img',
      });
    });

    it('ends and reports an expired session', () => {
      storeSession({ authenticatedAt: Date.now() - SESSION_LIFETIME_MS - 1000 });

      expect(getActiveSession()).toBeUndefined();
      expect(localStorage.getItem(SESSION_KEY)).toBeNull();
      expect(signOutUser).toHaveBeenCalledOnce();
      expect(showSnackbar).toHaveBeenCalledWith({
        message: 'Your session has expired. Please log in again.',
        variant: 'info',
      });
    });
  });

  describe('endSession', () => {
    it('is silent by default', async () => {
      storeSession();
      const listener = vi.fn();
      globalThis.addEventListener(SESSION_CHANGED_EVENT, listener);

      await endSession();

      expect(localStorage.getItem(SESSION_KEY)).toBeNull();
      expect(listener).toHaveBeenCalledOnce();
      expect(signOutUser).toHaveBeenCalledOnce();
      expect(showSnackbar).not.toHaveBeenCalled();
      globalThis.removeEventListener(SESSION_CHANGED_EVENT, listener);
    });

    it('shows a success message when not silent', async () => {
      await endSession(false);

      expect(showSnackbar).toHaveBeenCalledWith({
        message: 'You have been logged out.',
        variant: 'success',
      });
    });

    it('shows an error when sign out fails', async () => {
      vi.mocked(signOutUser).mockRejectedValue(new Error('fail'));

      await endSession(false);

      expect(showSnackbar).toHaveBeenCalledOnce();
      expect(showSnackbar).toHaveBeenCalledWith({
        message: 'Problems occurred during logout.',
        variant: 'error',
      });
    });
  });
});
