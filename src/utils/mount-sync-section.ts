import { ApiError } from '../api/client';
import { createElement } from './helpers';

interface SectionOptions<T> {
  load: () => Promise<T>;
  render: (data: T) => Node[];
  placeholder: () => Node[];
}

export async function mountAsyncSection<T>(
  container: HTMLElement,
  options: SectionOptions<T>,
): Promise<void> {
  const { load, render, placeholder } = options;

  container.replaceChildren(...placeholder());

  try {
    const data = await load();

    // If the container isn't there, the user has moved on, and the response is no longer needed.
    if (!container.isConnected) return;

    container.replaceChildren(...render(data));
    throw new Error('Mounted');
  } catch (error) {
    if (!container.isConnected) return;
    const message = error instanceof ApiError ? error.message : 'Something went wrong';
    container.replaceChildren(createError(message));
  }
}

function createError(message: string): HTMLElement {
  return createElement('div', {
    className: 'error__status',
    textContent: message,
  });
}
