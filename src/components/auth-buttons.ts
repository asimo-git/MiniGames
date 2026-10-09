import { endSession, getActiveSession, SESSION_CHANGED_EVENT } from '../api/login-session';
import { openDialog } from '../router/dialog-router';
import { createElement } from '../utils/helpers';

export function createAuthButtons(classPrefix: string, onClick?: () => void): HTMLElement {
  const wrapper = createElement('div', { className: `${classPrefix}s` });

  const render = (): void => {
    if (getActiveSession()) {
      const logOut = createElement('button', {
        className: `${classPrefix} ${classPrefix}--outline`,
        textContent: 'Log Out',
        attributes: { type: 'button' },
      });

      logOut.addEventListener('click', () => {
        void endSession(false);
        onClick?.();
      });

      wrapper.replaceChildren(logOut);
    } else {
      const logIn = createElement('button', {
        className: `${classPrefix} ${classPrefix}--outline`,
        textContent: 'Log In',
        attributes: { type: 'button' },
      });

      const signUp = createElement('button', {
        className: `${classPrefix} ${classPrefix}--primary`,
        textContent: 'Sign Up',
        attributes: { type: 'button' },
      });

      logIn.addEventListener('click', () => openDialog({ auth: 'login' }));
      signUp.addEventListener('click', () => openDialog({ auth: 'register' }));

      if (onClick) {
        logIn.addEventListener('click', onClick);
        signUp.addEventListener('click', onClick);
      }

      wrapper.replaceChildren(logIn, signUp);
    }
  };

  render();
  globalThis.addEventListener(SESSION_CHANGED_EVENT, render);

  return wrapper;
}
