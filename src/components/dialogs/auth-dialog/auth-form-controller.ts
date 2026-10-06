import {
  AUTH_ERROR_MESSAGES,
  DEFAULT_ERROR_MESSAGE,
  SUBMIT_LABELS,
} from '../../../data/auth-fields-config.ts';
import { registerWithEmail, signInWithEmail } from '../../../api/firebase';
import { createElement } from '../../../utils/helpers.ts';
import type { AuthMode } from '../../../router/router';
import {
  AUTH_FIELD_DEPENDENTS,
  AUTH_REQUIRED_FIELDS,
  createEmptyValues,
  validateField,
  type FieldName,
  type FormValues,
  type ValidationError,
} from '../../../utils/auth-validation';
import { hideDialog, setDialogLocked } from '../dialog-backdrop';
import { showSnackbar } from '../../../components/snackbar.ts';

export const AUTH_FORM_ID = 'auth-dialog-form';
const INVALID_INPUT_CLASS = 'auth-dialog__input--invalid';

export interface FieldBinding {
  readonly input: HTMLInputElement;
  readonly errorElement: HTMLElement;
  touched: boolean;
}

export interface AuthFormState {
  readonly mode: AuthMode;
  readonly values: FormValues;
  readonly fields: Map<FieldName, FieldBinding>;
  submitButton: HTMLButtonElement | undefined;
  formError: HTMLElement | undefined;
  isPending: boolean;
}

export function createAuthFormState(mode: AuthMode): AuthFormState {
  return {
    mode,
    values: createEmptyValues(),
    fields: new Map(),
    submitButton: undefined,
    formError: undefined,
    isPending: false,
  };
}

function isFormValid(state: AuthFormState): boolean {
  const requiredFields = AUTH_REQUIRED_FIELDS[state.mode];

  return requiredFields.every(
    (name) => validateField(state.mode, name, state.values) === undefined,
  );
}

export function refreshSubmitButton(state: AuthFormState): void {
  if (state.submitButton === undefined) {
    return;
  }

  state.submitButton.disabled = state.isPending || !isFormValid(state);
}

export async function handleFormSubmit(event: Event, state: AuthFormState): Promise<void> {
  event.preventDefault();

  if (state.isPending) {
    return;
  }

  if (!isFormValid(state)) {
    return;
  }

  clearFormError(state);
  setPendingState(state, true);

  try {
    await runAuthOperation(state);
    hideDialog();
    showSnackbar({
      message: state.mode === 'login' ? 'Login successful!' : 'Account created successfully!',
      variant: 'success',
    });
  } catch (error) {
    showFormError(state, error);
  } finally {
    setPendingState(state, false);
  }
}

export function handleFieldUpdate(state: AuthFormState, name: FieldName): void {
  const field = state.fields.get(name);

  if (field === undefined) {
    return;
  }

  field.touched = true;
  state.values[name] = field.input.value;

  renderFieldError(field, validateField(state.mode, name, state.values));

  const dependents = AUTH_FIELD_DEPENDENTS[name];

  for (const dependent of dependents) {
    const dependentField = state.fields.get(dependent);

    if (dependentField === undefined || !dependentField.touched) {
      continue;
    }

    renderFieldError(dependentField, validateField(state.mode, dependent, state.values));
  }

  refreshSubmitButton(state);
}

function setPendingState(state: AuthFormState, isPending: boolean): void {
  state.isPending = isPending;
  refreshSubmitButton(state);

  const button = state.submitButton;
  if (!button) return;

  if (isPending) {
    button.replaceChildren(
      createElement('img', {
        className: 'auth-dialog__spinner',
        attributes: { src: '/load-img.gif', alt: '', style: 'width: 19px; height: 19px;' },
      }),
    );
    return;
  }

  button.textContent = SUBMIT_LABELS[state.mode];
}

// ---------- Firebase ----------

async function runAuthOperation(state: AuthFormState): Promise<void> {
  setDialogLocked(true);

  try {
    // await new Promise(() => {});
    const { username, email, password } = state.values;
    if (state.mode === 'login') {
      await signInWithEmail(email, password);
    } else {
      await registerWithEmail(username, email, password);
    }
  } finally {
    setDialogLocked(false);
  }
}

// ---------- Errors ----------

function showFormError(state: AuthFormState, error: unknown): void {
  if (state.formError === undefined) {
    return;
  }

  const code =
    error instanceof Error && 'code' in error && typeof error.code === 'string' ? error.code : '';
  state.formError.textContent = AUTH_ERROR_MESSAGES[code] ?? DEFAULT_ERROR_MESSAGE;
  state.formError.hidden = false;
}

function clearFormError(state: AuthFormState): void {
  if (state.formError === undefined) {
    return;
  }

  state.formError.textContent = '';
  state.formError.hidden = true;
}

function renderFieldError(field: FieldBinding, message: ValidationError): void {
  const isShown = field.touched && message !== undefined;

  field.input.classList.toggle(INVALID_INPUT_CLASS, isShown);
  field.input.setAttribute('aria-invalid', String(isShown));
  field.errorElement.textContent = isShown ? message : '';
  field.errorElement.hidden = !isShown;
}
