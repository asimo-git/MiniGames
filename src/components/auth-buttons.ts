import { createElement } from '../utils/helpers';
import { openAuthDialog } from './dialogs/auth-dialog';

export function createAuthButtons(classPrefix: string, onClick?: () => void): HTMLElement {
  const wrapper = createElement('div', { className: `${classPrefix}s` });

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

  logIn.addEventListener('click', () => openAuthDialog('login'));
  signUp.addEventListener('click', () => openAuthDialog('register'));

  if (onClick) {
    logIn.addEventListener('click', onClick);
    signUp.addEventListener('click', onClick);
  }

  wrapper.append(logIn, signUp);
  return wrapper;
}
