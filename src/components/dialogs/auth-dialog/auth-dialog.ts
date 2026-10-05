import { createElement } from '../../../utils/helpers.ts';
import googleIcon from '../../../assets/icons/google.svg';
import {
  ICONS,
  REGISTER_FIELDS,
  LOGIN_FIELDS,
  type FieldConfig,
} from '../../../data/auth-fields-config.ts.ts';
import { hideDialog, showDialog } from '../dialog-backdrop.ts';
import type { AuthMode } from '../../../router/router.ts';
import { dialogState, switchDialog } from '../../../router/dialog-router.ts';
import {
  AUTH_FORM_ID,
  createAuthFormState,
  handleFieldUpdate,
  handleFormSubmit,
  refreshSubmitButton,
  type AuthFormState,
} from './auth-form-controller.ts';

function buildTabClassName(isActive: boolean): string {
  return isActive ? `auth-dialog__tab auth-dialog__tab--active` : `auth-dialog__tab`;
}

function createField(config: FieldConfig, state: AuthFormState): HTMLElement {
  const errorId = `${AUTH_FORM_ID}-${config.key}-error`;

  const label = createElement('label', {
    className: 'auth-dialog__label',
    textContent: config.label,
  });

  const icon = createElement('img', {
    className: 'auth-dialog__icon',
    attributes: {
      src: ICONS[config.icon],
      alt: '',
      'aria-hidden': 'true',
    },
  });

  const input = createElement('input', {
    className: 'auth-dialog__input',
    attributes: {
      type: config.type,
      placeholder: config.placeholder,
      name: config.key,
      'aria-describedby': errorId,
    },
  });

  const errorElement = createElement('p', {
    className: 'auth-dialog__error',
    attributes: {
      id: errorId,
      'aria-live': 'polite',
      hidden: '',
    },
  });

  state.fields.set(config.key, { input, errorElement, touched: false });
  input.addEventListener('input', () => handleFieldUpdate(state, config.key));

  const wrapperChildren: HTMLElement[] = [icon, input];

  if (config.showVisibilityToggle) {
    wrapperChildren.push(createPasswordVisibilityToggle(input));
  }

  const inputWrapper = createElement('div', {
    className: 'auth-dialog__input-wrapper',
    children: wrapperChildren,
  });

  return createElement('div', {
    className: 'auth-dialog__field',
    children: [label, inputWrapper, errorElement],
  });
}

function createPasswordVisibilityToggle(input: HTMLInputElement): HTMLButtonElement {
  const toggle = createElement('button', {
    className: 'auth-dialog__visibility-toggle',
    attributes: {
      type: 'button',
      'aria-label': 'Show password',
      'aria-pressed': 'false',
    },
  });

  toggle.addEventListener('click', () => {
    const isHidden = input.type === 'password';

    input.type = isHidden ? 'text' : 'password';
    toggle.classList.toggle('auth-dialog__visibility-toggle--visible', isHidden);
    toggle.setAttribute('aria-pressed', String(isHidden));
    toggle.setAttribute('aria-label', isHidden ? 'Hide password' : 'Show password');
  });

  return toggle;
}

function createTabs(mode: AuthMode, onSwitch: (nextMode: AuthMode) => void): HTMLElement {
  const loginTab = createElement('button', {
    className: buildTabClassName(mode === 'login'),
    textContent: 'Login',
    attributes: { type: 'button' },
  });

  const registerTab = createElement('button', {
    className: buildTabClassName(mode === 'register'),
    textContent: 'Register',
    attributes: { type: 'button' },
  });

  loginTab.addEventListener('click', () => onSwitch('login'));
  registerTab.addEventListener('click', () => onSwitch('register'));

  return createElement('div', {
    className: `auth-dialog__tabs`,
    children: [loginTab, registerTab],
  });
}

function createHeader(mode: AuthMode): HTMLElement {
  const title = createElement('h2', {
    className: `auth-dialog__title`,
    textContent: mode === 'login' ? 'Welcome Back!' : 'Create Account',
  });

  const subtitle = createElement('p', {
    className: `auth-dialog__subtitle`,
    textContent:
      mode === 'login'
        ? 'Sign in to resume your games and progress.'
        : 'Join MiniGames to track your score & streak.',
  });

  return createElement('div', {
    className: `auth-dialog__header`,
    children: [title, subtitle],
  });
}

function createForm(state: AuthFormState): HTMLElement {
  const actualFields = state.mode === 'login' ? LOGIN_FIELDS : REGISTER_FIELDS;
  const fields = actualFields.map((config) => createField(config, state));

  if (state.mode === 'login') {
    fields.push(
      createElement('a', {
        className: 'auth-dialog__forgot-password-link',
        textContent: 'Forgot Password?',
        attributes: { href: '#' },
      }),
    );
  }

  const form = createElement('form', {
    className: `auth-dialog__form`,
    attributes: {
      id: AUTH_FORM_ID,
      novalidate: '',
    },
    children: fields,
  });

  form.addEventListener('submit', (event) => {
    handleFormSubmit(event, state);
  });

  return form;
}

function createDivider(): HTMLElement {
  return createElement('div', {
    className: `auth-dialog__divider`,
    children: [
      createElement('span', { className: `auth-dialog__divider-line` }),
      createElement('span', {
        className: `auth-dialog__divider-label`,
        textContent: 'or',
      }),
      createElement('span', { className: `auth-dialog__divider-line` }),
    ],
  });
}

function createActions(state: AuthFormState): HTMLElement {
  const cta = createElement('button', {
    className: `auth-dialog__action`,
    textContent: state.mode === 'login' ? 'Login' : 'Create Account',
    attributes: { type: 'submit', form: AUTH_FORM_ID },
  });

  state.submitButton = cta;

  const googleIconElement = createElement('img', {
    className: `auth-dialog__google-icon`,
    attributes: {
      src: googleIcon,
      alt: '',
      'aria-hidden': 'true',
    },
  });

  const googleLabel = createElement('span', {
    textContent: state.mode === 'login' ? 'Continue with Google' : 'Sign up with Google',
  });

  const googleButton = createElement('button', {
    className: `auth-dialog__google-button`,
    attributes: { type: 'button' },
    children: [googleIconElement, googleLabel],
  });

  return createElement('div', {
    className: `auth-dialog__actions`,
    children: [cta, createDivider(), googleButton],
  });
}

function createFooter(mode: AuthMode, onSwitch: (nextMode: AuthMode) => void): HTMLElement {
  const text = createElement('span', {
    textContent: mode === 'login' ? "Don't have an account?" : 'Already have an account?',
  });

  const link = createElement('button', {
    className: `auth-dialog__footer-link`,
    textContent: mode === 'login' ? 'Register' : 'Login',
    attributes: { type: 'button' },
  });

  const nextMode: AuthMode = mode === 'login' ? 'register' : 'login';
  link.addEventListener('click', () => onSwitch(nextMode));

  return createElement('div', {
    className: `auth-dialog__footer`,
    children: [text, link],
  });
}

function createPanelContent(mode: AuthMode, onSwitch: (nextMode: AuthMode) => void): HTMLElement[] {
  const state = createAuthFormState(mode);

  const content = [
    createHeader(mode),
    createForm(state),
    createActions(state),
    createFooter(mode, onSwitch),
  ];

  refreshSubmitButton(state);

  return content;
}

function animatePanelSwap(
  panel: HTMLElement,
  mode: AuthMode,
  onSwitch: (nextMode: AuthMode) => void,
): void {
  panel.classList.add('auth-dialog__panel--leaving');

  panel.addEventListener(
    'transitionend',
    () => {
      panel.replaceChildren(...createPanelContent(mode, onSwitch));
      panel.classList.remove('auth-dialog__panel--leaving');
      panel.classList.add('auth-dialog__panel--entering');

      requestAnimationFrame(() => {
        panel.classList.remove('auth-dialog__panel--entering');
      });
    },
    { once: true },
  );
}

function createAuthDialogContent(initialMode: AuthMode): HTMLElement {
  let mode: AuthMode = initialMode;

  const tabsSlot = createElement('div', { className: 'auth-dialog__tabs-slot' });
  const panel = createElement('div', { className: 'auth-dialog__panel' });

  function switchMode(nextMode: AuthMode): void {
    if (nextMode === mode) {
      return;
    }

    mode = nextMode;
    tabsSlot.replaceChildren(createTabs(mode, switchMode));
    animatePanelSwap(panel, mode, switchMode);

    dialogState.dialogKey = `auth=${nextMode}`;
    switchDialog({ auth: nextMode });
  }

  tabsSlot.replaceChildren(createTabs(mode, switchMode));
  panel.replaceChildren(...createPanelContent(mode, switchMode));

  return createElement('div', { className: 'auth-dialog', children: [tabsSlot, panel] });
}

export function openAuthDialog(mode: AuthMode = 'login'): void {
  const content = createAuthDialogContent(mode);

  showDialog(content, { ariaLabel: 'Log in' });
}

export function closeAuthDialog(): void {
  hideDialog();
}
