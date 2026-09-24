import { createElement } from '../../utils/helpers';
import eyeIcon from '../../assets/icons/auth/visibility.svg';
import googleIcon from '../../assets/icons/google.svg';
import {
  ICONS,
  REGISTER_FIELDS,
  LOGIN_FIELDS,
  type FieldConfig,
} from '../../data/auth-fields-config.ts';
import { hideDialog, showDialog } from './dialog-backdrop.ts';

export type AuthMode = 'login' | 'register';

function buildTabClassName(isActive: boolean): string {
  return isActive ? `auth-dialog__tab auth-dialog__tab--active` : `auth-dialog__tab`;
}

function createField(config: FieldConfig): HTMLElement {
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
    },
  });

  const wrapperChildren: HTMLElement[] = [icon, input];

  if (config.showVisibilityToggle) {
    const visibilityIcon = createElement('span', {
      className: 'auth-dialog__visibility-toggle',
      children: [
        createElement('img', {
          className: 'auth-dialog__visibility-icon',
          attributes: {
            src: eyeIcon,
            alt: '',
            'aria-hidden': 'true',
          },
        }),
      ],
    });

    wrapperChildren.push(visibilityIcon);
  }

  const inputWrapper = createElement('div', {
    className: 'auth-dialog__input-wrapper',
    children: wrapperChildren,
  });

  return createElement('div', {
    className: 'auth-dialog__field',
    children: [label, inputWrapper],
  });
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

function createForm(mode: AuthMode): HTMLElement {
  const actualFields = mode === 'login' ? LOGIN_FIELDS : REGISTER_FIELDS;
  const fields = actualFields.map((config) => createField(config));

  if (mode === 'login') {
    fields.push(
      createElement('a', {
        className: 'auth-dialog__forgot-password-link',
        textContent: 'Forgot Password?',
        attributes: { href: '#' },
      }),
    );
  }

  return createElement('form', {
    className: `auth-dialog__form`,
    children: fields,
  });
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

function createActions(mode: AuthMode): HTMLElement {
  const cta = createElement('button', {
    className: `auth-dialog__action`,
    textContent: mode === 'login' ? 'Login' : 'Create Account',
    attributes: { type: 'submit' },
  });

  const googleIconElement = createElement('img', {
    className: `auth-dialog__google-icon`,
    attributes: {
      src: googleIcon,
      alt: '',
      'aria-hidden': 'true',
    },
  });

  const googleLabel = createElement('span', {
    textContent: mode === 'login' ? 'Continue with Google' : 'Sign up with Google',
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
  return [createHeader(mode), createForm(mode), createActions(mode), createFooter(mode, onSwitch)];
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
