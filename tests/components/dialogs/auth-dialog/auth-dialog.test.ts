import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  showDialog: vi.fn(),
  switchDialog: vi.fn(),
  dialogState: { dialogKey: undefined as string | undefined },
  createAuthFormState: vi.fn(),
  handleFieldUpdate: vi.fn(),
  handleFormSubmit: vi.fn(),
  handleGoogleSignIn: vi.fn(),
  refreshSubmitButton: vi.fn(),
}));

vi.mock('../../../../src/components/dialogs/dialog-backdrop', () => ({
  showDialog: mocks.showDialog,
}));
vi.mock('../../../../src/router/dialog-router', () => ({
  dialogState: mocks.dialogState,
  switchDialog: mocks.switchDialog,
}));
vi.mock('../../../../src/components/dialogs/auth-dialog/auth-form-controller', () => ({
  AUTH_FORM_ID: 'auth-form',
  createAuthFormState: mocks.createAuthFormState,
  handleFieldUpdate: mocks.handleFieldUpdate,
  handleFormSubmit: mocks.handleFormSubmit,
  handleGoogleSignIn: mocks.handleGoogleSignIn,
  refreshSubmitButton: mocks.refreshSubmitButton,
}));

vi.mock('../../../../src/data/auth-fields-config.ts', () => {
  const email = { key: 'email', label: 'Email', type: 'email', placeholder: 'e', icon: 'mail' };
  const password = {
    key: 'password',
    label: 'Password',
    type: 'password',
    placeholder: 'p',
    icon: 'lock',
    showVisibilityToggle: true,
  };
  const username = {
    key: 'username',
    label: 'Name',
    type: 'text',
    placeholder: 'u',
    icon: 'person',
  };

  return {
    ICONS: { mail: 'mail.svg', lock: 'lock.svg', person: 'person.svg' },
    LOGIN_FIELDS: [email, password],
    REGISTER_FIELDS: [username, email, password],
    SUBMIT_LABELS: { login: 'Log In', register: 'Sign Up' },
  };
});

import { openAuthDialog } from '../../../../src/components/dialogs/auth-dialog/auth-dialog';

function open(mode?: 'login' | 'register'): HTMLElement {
  openAuthDialog(mode);
  return mocks.showDialog.mock.calls.at(-1)![0] as HTMLElement;
}

const text = (root: Element, selector: string) => root.querySelector(selector)?.textContent;

describe('openAuthDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.dialogState.dialogKey = undefined;
    mocks.createAuthFormState.mockImplementation((mode: string) => ({
      mode,
      fields: new Map(),
    }));
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
      callback(0);
      return 0;
    });
  });

  it('renders the login form by default and shows it in the dialog', () => {
    const content = open();

    expect(mocks.showDialog).toHaveBeenCalledWith(content, { ariaLabel: 'Log in' });
    expect(mocks.createAuthFormState).toHaveBeenCalledWith('login');
    expect(text(content, '.auth-dialog__subtitle')).toContain('Sign in');
    expect(content.querySelectorAll('input')).toHaveLength(2);
    expect(content.querySelector('.auth-dialog__forgot-password-link')).not.toBeNull();
    expect(text(content, '.auth-dialog__action')).toBe('Log In');
    expect(content.querySelector('.auth-dialog__action')?.hasAttribute('disabled')).toBe(true);
    expect(text(content, '.auth-dialog__google-button')).toBe('Continue with Google');
    expect(text(content, '.auth-dialog__footer')).toBe("Don't have an account?Register");

    const [loginTab, registerTab] = content.querySelectorAll('.auth-dialog__tab');
    expect(loginTab.className).toContain('auth-dialog__tab--active');
    expect(registerTab.className).not.toContain('auth-dialog__tab--active');
  });

  it('renders the register form without the forgot-password link', () => {
    const content = open('register');

    expect(mocks.createAuthFormState).toHaveBeenCalledWith('register');
    expect(text(content, '.auth-dialog__title')).toBe('Create Account');
    expect(content.querySelector('.auth-dialog__forgot-password-link')).toBeNull();
    expect(text(content, '.auth-dialog__action')).toBe('Sign Up');
    expect(text(content, '.auth-dialog__google-button')).toBe('Sign up with Google');
    expect(text(content, '.auth-dialog__footer')).toBe('Already have an account?Login');
  });

  it('wires input, submit and Google handlers and the password visibility toggle', () => {
    const content = open();
    const state = mocks.createAuthFormState.mock.results[0].value;
    const password = content.querySelector<HTMLInputElement>('input[name="password"]')!;
    const toggle = content.querySelector<HTMLButtonElement>('.auth-dialog__visibility-toggle')!;

    password.dispatchEvent(new Event('input'));
    expect(mocks.handleFieldUpdate).toHaveBeenCalledWith(state, 'password');

    content.querySelector('form')?.dispatchEvent(new Event('submit', { cancelable: true }));
    expect(mocks.handleFormSubmit).toHaveBeenCalledWith(expect.any(Event), state);

    content.querySelector<HTMLButtonElement>('.auth-dialog__google-button')?.click();
    expect(mocks.handleGoogleSignIn).toHaveBeenCalledWith(state);

    toggle.click();
    expect(password.type).toBe('text');
    expect(toggle.getAttribute('aria-pressed')).toBe('true');
    expect(toggle.getAttribute('aria-label')).toBe('Hide password');

    toggle.click();
    expect(password.type).toBe('password');
    expect(toggle.getAttribute('aria-label')).toBe('Show password');
  });

  it('switches mode via a tab: updates tabs, syncs the router and swaps the panel', () => {
    const content = open();
    const panel = content.querySelector<HTMLElement>('.auth-dialog__panel')!;

    content.querySelectorAll<HTMLButtonElement>('.auth-dialog__tab')[0].click();
    expect(mocks.switchDialog).not.toHaveBeenCalled();

    content.querySelectorAll<HTMLButtonElement>('.auth-dialog__tab')[1].click();

    expect(mocks.switchDialog).toHaveBeenCalledExactlyOnceWith({ auth: 'register' });
    expect(mocks.dialogState.dialogKey).toBeDefined();
    expect(content.querySelectorAll('.auth-dialog__tab')[1].className).toContain('--active');
    expect(panel.classList.contains('auth-dialog__panel--leaving')).toBe(true);
    expect(text(panel, '.auth-dialog__title')).toBe('Welcome Back!');

    panel.dispatchEvent(new Event('transitionend'));

    expect(text(panel, '.auth-dialog__title')).toBe('Create Account');
    expect(panel.classList.contains('auth-dialog__panel--leaving')).toBe(false);
    expect(panel.classList.contains('auth-dialog__panel--entering')).toBe(false);
  });

  it('switches mode via the footer link', () => {
    const content = open('register');

    content.querySelector<HTMLButtonElement>('.auth-dialog__footer-link')?.click();

    expect(mocks.switchDialog).toHaveBeenCalledWith({ auth: 'login' });
  });
});
