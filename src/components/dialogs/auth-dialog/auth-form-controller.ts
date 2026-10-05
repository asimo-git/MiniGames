import type { AuthMode } from '../../../router/router';
import {
  areFieldsValid,
  AUTH_FIELD_DEPENDENTS,
  AUTH_REQUIRED_FIELDS,
  createEmptyValues,
  validateField,
  type FieldName,
  type FormValues,
  type ValidationError,
} from '../../../utils/auth-validation';

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
}

export function createAuthFormState(mode: AuthMode): AuthFormState {
  return {
    mode,
    values: createEmptyValues(),
    fields: new Map(),
    submitButton: undefined,
  };
}

export function refreshSubmitButton(state: AuthFormState): void {
  if (state.submitButton === undefined) {
    return;
  }

  state.submitButton.disabled = !areFieldsValid(
    state.mode,
    AUTH_REQUIRED_FIELDS[state.mode],
    state.values,
  );
}

export function handleFormSubmit(event: Event, state: AuthFormState): void {
  event.preventDefault();

  if (!areFieldsValid(state.mode, AUTH_REQUIRED_FIELDS[state.mode], state.values)) {
    return;
  }

  // TODO: запрос на login/register через api.ts
}

export function handleFieldUpdate(state: AuthFormState, name: FieldName): void {
  const field = state.fields.get(name);

  if (field === undefined) return;

  field.touched = true;
  state.values[name] = field.input.value;

  renderFieldError(field, validateField(state.mode, name, state.values));

  const dependents = AUTH_FIELD_DEPENDENTS[name];

  for (const dependent of dependents) {
    const dependentField = state.fields.get(dependent);
    if (dependentField === undefined || !dependentField.touched) continue;

    renderFieldError(dependentField, validateField(state.mode, dependent, state.values));
  }

  refreshSubmitButton(state);
}

function renderFieldError(field: FieldBinding, message: ValidationError): void {
  const isShown = field.touched && message !== undefined;

  field.input.classList.toggle(INVALID_INPUT_CLASS, isShown);
  field.input.setAttribute('aria-invalid', String(isShown));
  field.errorElement.textContent = isShown ? message : '';
  field.errorElement.hidden = !isShown;
}
