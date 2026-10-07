import { createErrorBanner, type ErrorBannerSize } from '../components/error-banner';
import { ApiError } from '../api/client';
import { showSnackbar } from '../components/snackbar';

interface SectionOptions<T> {
  load: () => Promise<T>;
  render: (data: T) => Node[];
  errorSize?: ErrorBannerSize;
  skeleton: () => Node[];
}

export async function mountAsyncSection<T>(
  container: HTMLElement,
  options: SectionOptions<T>,
): Promise<void> {
  const { load, render, skeleton, errorSize = 'default' } = options;

  container.replaceChildren(...skeleton());

  let data: T;
  try {
    data = await load();
    // check an error ui
    // throw new Error('Error');
  } catch (error) {
    if (!container.isConnected) return;
    const message = error instanceof ApiError ? error.message : 'Failed to load data';
    container.replaceChildren(
      createErrorBanner({
        message,
        size: errorSize,
        onRetry: () => {
          void mountAsyncSection(container, options);
        },
      }),
    );
    showSnackbar({ variant: 'error', message });
    return;
  }

  // If the container isn't there, the user has moved on, and the response is no longer needed.
  if (!container.isConnected) return;

  try {
    container.replaceChildren(...render(data));
  } catch (error) {
    console.error('Render failed', error);
    container.replaceChildren(
      createErrorBanner({ message: 'Failed to display data', size: errorSize }),
    );
  }
}
