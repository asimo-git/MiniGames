import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  validateField: vi.fn(),
  signInWithEmail: vi.fn(),
  registerWithEmail: vi.fn(),
  signInWithGoogle: vi.fn(),
  setDialogLocked: vi.fn(),
  showSnackbar: vi.fn(),
  saveSession: vi.fn(),
  closeDialog: vi.fn(),
}));

vi.mock('../../../../src/data/auth-fields-config', () => ({
  AUTH_ERROR_MESSAGES: { 'auth/wrong-password': 'Wrong password' },
  DEFAULT_ERROR_MESSAGE: 'Default error',
  SUBMIT_LABELS: { login: 'Log In', register: 'Sign Up' },
}));
vi.mock('../../../../src/api/firebase', () => ({
  signInWithEmail: mocks.signInWithEmail,
  registerWithEmail: mocks.registerWithEmail,
  signInWithGoogle: mocks.signInWithGoogle,
}));
vi.mock('../../../../src/utils/auth-validation', () => ({
  AUTH_REQUIRED_FIELDS: {
    login: ['email', 'password'],
    register: ['username', 'email', 'password'],
  },

  AUTH_FIELD_DEPENDENTS: { username: [], email: [], password: ['username', 'email', 'missing'] },
  createEmptyValues: () => ({ username: '', email: '', password: '' }),
  validateField: mocks.validateField,
}));
vi.mock('../../../../src/components/dialogs/dialog-backdrop', () => ({
  setDialogLocked: mocks.setDialogLocked,
}));
vi.mock('../../../../src/components/snackbar', () => ({ showSnackbar: mocks.showSnackbar }));
vi.mock('../../../../src/api/login-session', () => ({ saveSession: mocks.saveSession }));
vi.mock('../../../../src/router/dialog-router', () => ({ closeDialog: mocks.closeDialog }));

import {
  createAuthFormState,
  handleFieldUpdate,
  handleFormSubmit,
  handleGoogleSignIn,
  refreshSubmitButton,
} from '../../../../src/components/dialogs/auth-dialog/auth-form-controller';

type FieldName = Parameters<typeof handleFieldUpdate>[1];

function makeState(mode: 'login' | 'register' = 'login') {
  const state = createAuthFormState(mode);
  state.submitButton = document.createElement('button');
  state.googleButton = document.createElement('button');
  state.formError = document.createElement('p');
  state.formError.hidden = true;
  return state;
}

function addField(state: ReturnType<typeof makeState>, name: FieldName, touched = false) {
  const binding = {
    input: document.createElement('input'),
    errorElement: document.createElement('p'),
    touched,
  };
  state.fields.set(name, binding);
  return binding;
}

function fillValues(state: ReturnType<typeof makeState>): void {
  state.values.username = 'Ann';
  state.values.email = 'a@b.c';
  state.values.password = 'secret';
}

describe('auth-form-controller', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.validateField.mockReturnValue(undefined);
  });

  describe('state and submit button', () => {
    it('creates an idle empty state', () => {
      const state = createAuthFormState('register');

      expect(state).toMatchObject({
        mode: 'register',
        values: { username: '', email: '', password: '' },
        submitButton: undefined,
        googleButton: undefined,
        formError: undefined,
        isPending: false,
      });
      expect(state.fields.size).toBe(0);
    });

    it('refreshSubmitButton tolerates a missing button and follows validity and pending', () => {
      expect(() => refreshSubmitButton(createAuthFormState('login'))).not.toThrow();

      const state = makeState();
      mocks.validateField.mockReturnValue('bad');
      refreshSubmitButton(state);
      expect(state.submitButton?.disabled).toBe(true);

      mocks.validateField.mockReturnValue(undefined);
      refreshSubmitButton(state);
      expect(state.submitButton?.disabled).toBe(false);

      state.isPending = true;
      refreshSubmitButton(state);
      expect(state.submitButton?.disabled).toBe(true);
    });
  });

  describe('handleFieldUpdate', () => {
    it('ignores unknown fields', () => {
      handleFieldUpdate(makeState(), 'email');

      expect(mocks.validateField).not.toHaveBeenCalled();
    });

    it('stores the value, shows and clears the field error', () => {
      const state = makeState();
      const email = addField(state, 'email');
      email.input.value = 'x';
      mocks.validateField.mockReturnValue('Invalid email');

      handleFieldUpdate(state, 'email');

      expect(email.touched).toBe(true);
      expect(state.values.email).toBe('x');
      expect(email.errorElement.textContent).toBe('Invalid email');
      expect(email.errorElement.hidden).toBe(false);
      expect(email.input.classList.contains('auth-dialog__input--invalid')).toBe(true);
      expect(email.input.getAttribute('aria-invalid')).toBe('true');

      mocks.validateField.mockReturnValue(undefined);
      handleFieldUpdate(state, 'email');

      expect(email.errorElement.textContent).toBe('');
      expect(email.errorElement.hidden).toBe(true);
      expect(email.input.getAttribute('aria-invalid')).toBe('false');
    });

    it('revalidates only touched dependents', () => {
      const state = makeState('register');
      addField(state, 'password');
      const username = addField(state, 'username', true);
      const email = addField(state, 'email', false);
      mocks.validateField.mockImplementation((_mode: string, name: string) =>
        name === 'username' ? 'Dependent error' : undefined,
      );

      handleFieldUpdate(state, 'password');

      expect(username.errorElement.textContent).toBe('Dependent error');
      expect(email.errorElement.textContent).toBe('');
      expect(mocks.validateField).not.toHaveBeenCalledWith('register', 'email', expect.anything());
    });
  });

  describe('submit flows', () => {
    it('prevents default and does nothing while pending or invalid', async () => {
      const event = new Event('submit', { cancelable: true });
      const pending = makeState();
      pending.isPending = true;

      await handleFormSubmit(event, pending);
      expect(event.defaultPrevented).toBe(true);

      mocks.validateField.mockReturnValue('bad');
      await handleFormSubmit(event, makeState());

      expect(mocks.signInWithEmail).not.toHaveBeenCalled();
      expect(mocks.setDialogLocked).not.toHaveBeenCalled();
    });

    it.each([
      {
        mode: 'login' as const,
        operation: mocks.signInWithEmail,
        args: ['a@b.c', 'secret'],
        message: 'Login successful!',
      },
      {
        mode: 'register' as const,
        operation: mocks.registerWithEmail,
        args: ['Ann', 'a@b.c', 'secret'],
        message: 'Account created successfully!',
      },
    ])('$mode: calls Firebase, saves the session, closes the dialog and notifies', async (c) => {
      const user = { uid: '1' };
      c.operation.mockResolvedValue(user);
      const state = makeState(c.mode);
      fillValues(state);

      await handleFormSubmit(new Event('submit', { cancelable: true }), state);

      expect(c.operation).toHaveBeenCalledWith(...c.args);
      expect(mocks.saveSession).toHaveBeenCalledWith(user);
      expect(mocks.setDialogLocked).toHaveBeenNthCalledWith(1, true);
      expect(mocks.setDialogLocked).toHaveBeenLastCalledWith(false);
      expect(mocks.closeDialog).toHaveBeenCalledOnce();
      expect(mocks.showSnackbar).toHaveBeenCalledWith({ message: c.message, variant: 'success' });
      expect(state.isPending).toBe(false);
    });

    it('handleGoogleSignIn skips when pending and signs in otherwise', async () => {
      const pending = makeState();
      pending.isPending = true;
      await handleGoogleSignIn(pending);
      expect(mocks.signInWithGoogle).not.toHaveBeenCalled();

      mocks.signInWithGoogle.mockResolvedValue({ uid: '1' });
      await handleGoogleSignIn(makeState());
      expect(mocks.signInWithGoogle).toHaveBeenCalledOnce();
    });

    it('shows a spinner on the active button while pending and restores labels afterwards', async () => {
      let resolve!: (user: object) => void;
      mocks.signInWithGoogle.mockReturnValue(new Promise((r) => (resolve = r)));
      const state = makeState();
      state.googleButton!.innerHTML = '<span>Continue with Google</span>';

      const flow = handleGoogleSignIn(state);

      expect(state.googleButton?.querySelector('span img.auth-dialog__spinner')).not.toBeNull();
      expect(state.googleButton?.hasAttribute('disabled')).toBe(true);
      expect(state.submitButton?.hasAttribute('disabled')).toBe(true);
      expect(state.submitButton?.textContent).toBe('Log In');
      expect(mocks.setDialogLocked).toHaveBeenCalledWith(true);

      resolve({ uid: '1' });
      await flow;

      expect(state.googleButton?.querySelector('span')?.textContent).toBe('Continue with Google');
      expect(state.googleButton?.hasAttribute('disabled')).toBe(false);
      expect(state.submitButton?.hasAttribute('disabled')).toBe(false);
    });
  });

  describe('error handling', () => {
    const withCode = (code: string) => Object.assign(new Error('x'), { code });

    it.each([
      { name: 'known code', error: withCode('auth/wrong-password'), text: 'Wrong password' },
      { name: 'unknown code', error: withCode('auth/other'), text: 'Default error' },
      { name: 'error without code', error: new Error('x'), text: 'Default error' },
      { name: 'non-error value', error: 'boom', text: 'Default error' },
    ])('shows a message for $name and unlocks the dialog', async ({ error, text }) => {
      mocks.signInWithGoogle.mockRejectedValue(error);
      const state = makeState();

      await handleGoogleSignIn(state);

      expect(state.formError?.textContent).toBe(text);
      expect(state.formError?.hidden).toBe(false);
      expect(mocks.setDialogLocked).toHaveBeenLastCalledWith(false);
      expect(mocks.closeDialog).not.toHaveBeenCalled();
      expect(mocks.showSnackbar).not.toHaveBeenCalled();
    });

    it.each(['auth/popup-closed-by-user', 'auth/cancelled-popup-request'])(
      'stays silent for %s and clears the previous error',
      async (code) => {
        mocks.signInWithGoogle.mockRejectedValue(withCode(code));
        const state = makeState();
        state.formError!.textContent = 'old';
        state.formError!.hidden = false;

        await handleGoogleSignIn(state);

        expect(state.formError?.textContent).toBe('');
        expect(state.formError?.hidden).toBe(true);
      },
    );

    it('works without a form error element', async () => {
      mocks.signInWithGoogle.mockRejectedValue(withCode('auth/wrong-password'));
      const state = makeState();
      state.formError = undefined;

      await expect(handleGoogleSignIn(state)).resolves.toBeUndefined();
    });
  });
});
