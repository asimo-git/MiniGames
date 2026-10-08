import { describe, expect, it } from 'vitest';

import {
  AUTH_FIELD_DEPENDENTS,
  AUTH_REQUIRED_FIELDS,
  createEmptyValues,
  validateConfirmPassword,
  validateEmail,
  validateField,
  validateLoginPassword,
  validateRegisterPassword,
  validateUsername,
  type FormValues,
} from '../../src/utils/auth-validation';

function values(overrides: Partial<FormValues> = {}): FormValues {
  return { ...createEmptyValues(), ...overrides };
}

describe('validateEmail', () => {
  it('requires a value', () => {
    expect(validateEmail('')).toBe('Email is required');
  });

  it.each([
    'invalid.email',
    'user@@example.com',
    '@example.com',
    'user@example..com',
    'user name@example.com',
    'user@exam ple.com',
  ])('rejects the malformed address %s', (email) => {
    expect(validateEmail(email)).toBe('Enter a valid email address');
  });

  it.each(['a@b.co', 'USER.Name99+tag@Example-Site.co.uk', 'first.last@sub.example.com'])(
    'accepts the well-formed address %s',
    (email) => {
      expect(validateEmail(email)).toBeUndefined();
    },
  );
});

describe('validateUsername', () => {
  it('requires a value', () => {
    expect(validateUsername('')).toBe('Username is required');
  });

  it('rejects a username shorter than the minimum length', () => {
    expect(validateUsername('A')).toBe('Username must be 2–30 characters long');
  });

  it('rejects a username longer than the maximum length', () => {
    const tooLong = `A${'b'.repeat(30)}`; // 31 chars
    expect(validateUsername(tooLong)).toBe('Username must be 2–30 characters long');
  });

  it('rejects characters outside English letters and digits', () => {
    expect(validateUsername('Abc_123')).toBe(
      'Username can contain only English letters and digits',
    );
  });

  it('rejects non-ASCII letters even if otherwise well formed', () => {
    expect(validateUsername('Žan')).toBe('Username can contain only English letters and digits');
  });

  it('rejects a username that does not start with an uppercase letter', () => {
    expect(validateUsername('abcde')).toBe('Username must start with an uppercase English letter');
  });

  it('checks the allowed-character rule before the starting-letter rule', () => {
    expect(validateUsername('1bc_de')).toBe('Username can contain only English letters and digits');
  });

  it('accepts a username at the minimum boundary length', () => {
    expect(validateUsername('Ab')).toBeUndefined();
  });

  it('accepts a username at the maximum boundary length', () => {
    const exactlyMax = `A${'b'.repeat(29)}`; // 30 chars total
    expect(exactlyMax).toHaveLength(30);
    expect(validateUsername(exactlyMax)).toBeUndefined();
  });

  it('accepts a well-formed username', () => {
    expect(validateUsername('Mario64')).toBeUndefined();
  });
});

describe('validateRegisterPassword', () => {
  it('requires a value', () => {
    expect(validateRegisterPassword('')).toBe('Password is required');
  });

  it('rejects a password shorter than the minimum length', () => {
    expect(validateRegisterPassword('Ab1!')).toBe('Password must be at least 6 characters long');
  });

  it('rejects whitespace and non-ASCII characters', () => {
    expect(validateRegisterPassword('Abc 123!')).toBe(
      'Password can contain only English letters, digits and special characters',
    );
  });

  it('checks the allowed-character rule before composition rules', () => {
    expect(validateRegisterPassword('Abcdéf1!')).toBe(
      'Password can contain only English letters, digits and special characters',
    );
  });

  it('requires an uppercase letter', () => {
    expect(validateRegisterPassword('abcdef1!')).toBe(
      'Password must contain an uppercase English letter',
    );
  });

  it('requires a digit', () => {
    expect(validateRegisterPassword('Abcdefg!')).toBe('Password must contain a digit');
  });

  it('requires a special character', () => {
    expect(validateRegisterPassword('Abcdef12')).toBe('Password must contain a special character');
  });

  it('accepts a password satisfying every rule', () => {
    expect(validateRegisterPassword('Abcdef1!')).toBeUndefined();
  });
});

describe('validateLoginPassword', () => {
  it('requires a value', () => {
    expect(validateLoginPassword('')).toBe('Password is required');
  });

  it('rejects a password shorter than the minimum length', () => {
    expect(validateLoginPassword('Ab1!')).toBe('Password must be at least 6 characters long');
  });

  it('is more permissive than registration: no composition rules are enforced', () => {
    expect(validateLoginPassword('aaaaaa')).toBeUndefined();
  });
});

describe('validateConfirmPassword', () => {
  it('requires a value', () => {
    expect(validateConfirmPassword('', 'Abcdef1!')).toBe('Please confirm your password');
  });

  it('rejects a mismatched confirmation', () => {
    expect(validateConfirmPassword('Abcdef1?', 'Abcdef1!')).toBe('Passwords do not match');
  });
});

describe('validateField', () => {
  it('routes the email field to validateEmail regardless of mode', () => {
    const formValues = values({ email: 'not-an-email' });

    expect(validateField('login', 'email', formValues)).toBe('Enter a valid email address');
    expect(validateField('register', 'email', formValues)).toBe('Enter a valid email address');
  });

  it('routes the username field to validateUsername regardless of mode', () => {
    const formValues = values({ username: 'lowercase' });

    expect(validateField('login', 'username', formValues)).toBe(
      'Username must start with an uppercase English letter',
    );
    expect(validateField('register', 'username', formValues)).toBe(
      'Username must start with an uppercase English letter',
    );
  });

  it('applies the stricter register password rules in register mode', () => {
    const formValues = values({ password: 'alllowercase' });

    expect(validateField('register', 'password', formValues)).toBe(
      'Password must contain an uppercase English letter',
    );
  });

  it('applies the looser login password rules in login mode', () => {
    const formValues = values({ password: 'alllowercase' });

    expect(validateField('login', 'password', formValues)).toBeUndefined();
  });

  it('routes the confirmPassword field using both confirmPassword and password from the form', () => {
    const matching = values({ password: 'Abcdef1!', confirmPassword: 'Abcdef1!' });
    const mismatched = values({ password: 'Abcdef1!', confirmPassword: 'Other1!' });

    expect(validateField('register', 'confirmPassword', matching)).toBeUndefined();
    expect(validateField('register', 'confirmPassword', mismatched)).toBe('Passwords do not match');
  });
});

describe('createEmptyValues', () => {
  it('returns every field initialized to an empty string', () => {
    expect(createEmptyValues()).toEqual({
      email: '',
      username: '',
      password: '',
      confirmPassword: '',
    });
  });

  it('returns a fresh object on every call', () => {
    const first = createEmptyValues();
    const second = createEmptyValues();

    expect(first).not.toBe(second);

    first.email = 'mutated@example.com';
    expect(second.email).toBe('');
  });
});

describe('AUTH_REQUIRED_FIELDS', () => {
  it('requires only email and password for login', () => {
    expect(AUTH_REQUIRED_FIELDS.login).toEqual(['email', 'password']);
  });

  it('requires every field for registration', () => {
    expect(AUTH_REQUIRED_FIELDS.register).toEqual([
      'email',
      'username',
      'password',
      'confirmPassword',
    ]);
  });
});

describe('AUTH_FIELD_DEPENDENTS', () => {
  it('declares that editing the password field should also re-validate confirmPassword', () => {
    expect(AUTH_FIELD_DEPENDENTS.password).toEqual(['confirmPassword']);
  });

  it('declares no dependents for fields that nothing else derives from', () => {
    expect(AUTH_FIELD_DEPENDENTS.email).toEqual([]);
    expect(AUTH_FIELD_DEPENDENTS.username).toEqual([]);
    expect(AUTH_FIELD_DEPENDENTS.confirmPassword).toEqual([]);
  });
});
