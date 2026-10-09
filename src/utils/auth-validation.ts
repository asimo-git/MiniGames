import type { AuthMode } from '../router/router';

export type ValidationError = string | undefined;
export type FieldName = 'email' | 'username' | 'password' | 'confirmPassword';
export type FormValues = Record<FieldName, string>;

function checkRule(rules: ReadonlyArray<[condition: boolean, message: string]>): ValidationError {
  for (const [isOk, message] of rules) {
    if (!isOk) return message;
  }
  return undefined;
}

const EMAIL_PATTERN =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
const USERNAME_ALLOWED_PATTERN = /^[\dA-Za-z]+$/;
const USERNAME_START_PATTERN = /^[A-Z]/;
const PASSWORD_ALLOWED_PATTERN = /^[!-~]+$/;
const UPPERCASE_PATTERN = /[A-Z]/;
const DIGIT_PATTERN = /\d/;
const SPECIAL_CHARACTER_PATTERN = /[^\dA-Za-z]/;

const USERNAME_MIN_LENGTH = 2;
const USERNAME_MAX_LENGTH = 30;
const PASSWORD_MIN_LENGTH = 6;

export const validateEmail = (value: string): ValidationError =>
  checkRule([
    [value.length > 0, 'Email is required'],
    [EMAIL_PATTERN.test(value), 'Enter a valid email address'],
  ]);

export const validateUsername = (value: string): ValidationError =>
  checkRule([
    [value.length > 0, 'Username is required'],
    [
      value.length >= USERNAME_MIN_LENGTH && value.length <= USERNAME_MAX_LENGTH,
      `Username must be ${USERNAME_MIN_LENGTH}–${USERNAME_MAX_LENGTH} characters long`,
    ],
    [USERNAME_ALLOWED_PATTERN.test(value), 'Username can contain only English letters and digits'],
    [USERNAME_START_PATTERN.test(value), 'Username must start with an uppercase English letter'],
  ]);

export const validateRegisterPassword = (value: string): ValidationError =>
  checkRule([
    [value.length > 0, 'Password is required'],
    [
      value.length >= PASSWORD_MIN_LENGTH,
      `Password must be at least ${PASSWORD_MIN_LENGTH} characters long`,
    ],
    [
      PASSWORD_ALLOWED_PATTERN.test(value),
      'Password can contain only English letters, digits and special characters',
    ],
    [UPPERCASE_PATTERN.test(value), 'Password must contain an uppercase English letter'],
    [DIGIT_PATTERN.test(value), 'Password must contain a digit'],
    [SPECIAL_CHARACTER_PATTERN.test(value), 'Password must contain a special character'],
  ]);

export const validateLoginPassword = (value: string): ValidationError =>
  checkRule([
    [value.length > 0, 'Password is required'],
    [
      value.length >= PASSWORD_MIN_LENGTH,
      `Password must be at least ${PASSWORD_MIN_LENGTH} characters long`,
    ],
  ]);

export const validateConfirmPassword = (value: string, password: string): ValidationError =>
  checkRule([
    [value.length > 0, 'Please confirm your password'],
    [value === password, 'Passwords do not match'],
  ]);

type FieldValidator = (mode: AuthMode, values: FormValues) => ValidationError;

const FIELD_VALIDATORS: Record<FieldName, FieldValidator> = {
  email: (_mode, values) => validateEmail(values.email),
  username: (_mode, values) => validateUsername(values.username),
  password: (mode, values) =>
    mode === 'register'
      ? validateRegisterPassword(values.password)
      : validateLoginPassword(values.password),
  confirmPassword: (_mode, values) =>
    validateConfirmPassword(values.confirmPassword, values.password),
};

export function createEmptyValues(): FormValues {
  return { email: '', username: '', password: '', confirmPassword: '' };
}

export function validateField(
  mode: AuthMode,
  name: FieldName,
  values: FormValues,
): ValidationError {
  return FIELD_VALIDATORS[name](mode, values);
}

export const AUTH_REQUIRED_FIELDS: Record<AuthMode, readonly FieldName[]> = {
  login: ['email', 'password'],
  register: ['email', 'username', 'password', 'confirmPassword'],
};

export const AUTH_FIELD_DEPENDENTS: Record<FieldName, readonly FieldName[]> = {
  email: [],
  username: [],
  password: ['confirmPassword'],
  confirmPassword: [],
};
