import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  endSession: vi.fn(),
  getActiveSession: vi.fn(),
  openDialog: vi.fn(),
}));

vi.mock('../../src/api/login-session', () => ({
  endSession: mocks.endSession,
  getActiveSession: mocks.getActiveSession,
  SESSION_CHANGED_EVENT: 'session-changed',
}));
vi.mock('../../src/router/dialog-router', () => ({ openDialog: mocks.openDialog }));

import { createAuthButtons } from '../../src/components/auth-buttons';

const withAndWithoutCallback = [{ hasCallback: false }, { hasCallback: true }];

describe('createAuthButtons', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it.each(withAndWithoutCallback)(
    'logged out: renders Log In / Sign Up and opens dialogs (callback: $hasCallback)',
    ({ hasCallback }) => {
      mocks.getActiveSession.mockReturnValue(undefined);
      const onClick = vi.fn<() => void>();

      const wrapper = createAuthButtons('btn', hasCallback ? onClick : undefined);
      const [logIn, signUp] = wrapper.querySelectorAll('button');

      expect(wrapper.className).toBe('btns');
      expect([logIn.textContent, signUp.textContent]).toEqual(['Log In', 'Sign Up']);
      expect(logIn.className).toBe('btn btn--outline');
      expect(signUp.className).toBe('btn btn--primary');

      logIn.click();
      signUp.click();

      expect(mocks.openDialog).toHaveBeenNthCalledWith(1, { auth: 'login' });
      expect(mocks.openDialog).toHaveBeenNthCalledWith(2, { auth: 'register' });
      expect(onClick).toHaveBeenCalledTimes(hasCallback ? 2 : 0);
    },
  );

  it.each(withAndWithoutCallback)(
    'logged in: renders Log Out and ends the session (callback: $hasCallback)',
    ({ hasCallback }) => {
      mocks.getActiveSession.mockReturnValue({ user: 'ann' });
      const onClick = vi.fn<() => void>();

      const wrapper = createAuthButtons('btn', hasCallback ? onClick : undefined);
      const buttons = wrapper.querySelectorAll('button');

      expect(buttons).toHaveLength(1);
      expect(buttons[0].textContent).toBe('Log Out');
      expect(buttons[0].className).toBe('btn btn--outline');

      buttons[0].click();

      expect(mocks.endSession).toHaveBeenCalledExactlyOnceWith(false);
      expect(onClick).toHaveBeenCalledTimes(hasCallback ? 1 : 0);
    },
  );

  it('re-renders when the session changes', () => {
    mocks.getActiveSession.mockReturnValue(undefined);
    const wrapper = createAuthButtons('btn');
    expect(wrapper.querySelectorAll('button')).toHaveLength(2);

    mocks.getActiveSession.mockReturnValue({ user: 'ann' });
    globalThis.dispatchEvent(new Event('session-changed'));

    expect(wrapper.querySelectorAll('button')).toHaveLength(1);
    expect(wrapper.textContent).toBe('Log Out');
  });
});
