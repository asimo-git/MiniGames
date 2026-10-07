import { signOut, type User } from 'firebase/auth';
import { auth } from './firebase';
import { showSnackbar } from '../components/snackbar.ts';

export const SESSION_KEY = `minigames:${import.meta.env.VITE_FIREBASE_APP_ID}:app-session`;

const SESSION_LIFETIME_MS = 5 * 60 * 1000;

export const SESSION_CHANGED_EVENT = 'app-session-change';

export interface AppSession {
  displayName: string;
  email: string;
  authenticatedAt: number;
  avatarUrl?: string;
}

export function saveSession(user: User): void {
  const session: AppSession = {
    displayName: user.displayName ?? '',
    email: user.email ?? '',
    authenticatedAt: Date.now(),
  };

  if (user.photoURL) {
    session.avatarUrl = user.photoURL;
  }

  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  globalThis.dispatchEvent(new Event(SESSION_CHANGED_EVENT));
}

export function getActiveSession(): AppSession | undefined {
  const raw = localStorage.getItem(SESSION_KEY);

  if (raw === null) {
    return undefined;
  }

  const session = parseSession(raw);

  if (session === undefined) {
    void endSession();
    return undefined;
  }

  if (Date.now() - session.authenticatedAt >= SESSION_LIFETIME_MS) {
    void endSession();
    showSnackbar({ message: 'Your session has expired. Please log in again.', variant: 'info' });
    return undefined;
  }

  return session;
}

export async function endSession(): Promise<void> {
  localStorage.removeItem(SESSION_KEY);
  globalThis.dispatchEvent(new Event(SESSION_CHANGED_EVENT));

  try {
    await signOut(auth);
    showSnackbar({ message: 'You have been logged out.', variant: 'success' });
  } catch {
    showSnackbar({ message: 'Problems occurred during logout.', variant: 'error' });
  }
}

function parseSession(raw: string): AppSession | undefined {
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown> | null;
    if (!parsed || typeof parsed !== 'object') return undefined;

    const { displayName, email, authenticatedAt, avatarUrl } = parsed;

    if (
      typeof displayName !== 'string' ||
      typeof email !== 'string' ||
      typeof authenticatedAt !== 'number' ||
      !Number.isFinite(authenticatedAt) ||
      (avatarUrl !== undefined && typeof avatarUrl !== 'string')
    ) {
      return undefined;
    }

    return {
      displayName,
      email,
      authenticatedAt,
      ...(avatarUrl !== undefined && { avatarUrl }),
    };
  } catch {
    return undefined;
  }
}
