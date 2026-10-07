import personIcon from '../assets/icons/auth/person.svg';
import mailIcon from '../assets/icons/auth/mail.svg';
import lockIcon from '../assets/icons/auth/lock.svg';
import type { FieldName } from '../utils/auth-validation';
import type { AuthMode } from '../router/router';

export const SUBMIT_LABELS: Record<AuthMode, string> = {
  login: 'Login',
  register: 'Create account',
};

export const ICONS = {
  person: personIcon,
  mail: mailIcon,
  lock: lockIcon,
} as const;

export interface FieldConfig {
  key: FieldName;
  label: string;
  icon: keyof typeof ICONS;
  placeholder: string;
  type: string;
  showVisibilityToggle?: boolean;
}

export const LOGIN_FIELDS: FieldConfig[] = [
  {
    key: 'email',
    label: 'Email Address',
    icon: 'mail',
    placeholder: 'e.g. alex@minigames.com',
    type: 'email',
  },
  {
    key: 'password',
    label: 'Password',
    icon: 'lock',
    placeholder: '••••••••',
    type: 'password',
    showVisibilityToggle: true,
  },
];

export const REGISTER_FIELDS: FieldConfig[] = [
  {
    key: 'username',
    label: 'Username',
    icon: 'person',
    placeholder: 'e.g. CozyGamer_99',
    type: 'text',
  },
  {
    key: 'email',
    label: 'Email Address',
    icon: 'mail',
    placeholder: 'your.email@domain.com',
    type: 'email',
  },
  {
    key: 'password',
    label: 'Password',
    icon: 'lock',
    placeholder: 'Min. 8 characters',
    type: 'password',
    showVisibilityToggle: true,
  },
  {
    key: 'confirmPassword',
    label: 'Confirm Password',
    icon: 'lock',
    placeholder: 'Repeat your password',
    type: 'password',
    showVisibilityToggle: true,
  },
];

// ---------- Error messages ----------

export const DEFAULT_ERROR_MESSAGE = 'Failed to complete the request. Please try again.';

export const AUTH_ERROR_MESSAGES: Record<string, string> = {
  'auth/invalid-credential': 'Incorrect email or password.',
  'auth/invalid-email': 'Invalid email.',
  'auth/email-already-in-use': 'This email is already registered.',
  'auth/weak-password': 'The password is too weak.',
  'auth/network-request-failed': 'No internet connection.',
  'auth/too-many-requests': 'Too many attempts. Please try again later.',
};
