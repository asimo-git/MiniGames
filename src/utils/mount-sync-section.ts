import { createErrorBanner, type ErrorBannerSize } from '../components/error-banner';
import { ApiError } from '../api/client';

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

  try {
    const data = await load();

    // If the container isn't there, the user has moved on, and the response is no longer needed.
    if (!container.isConnected) return;

    // check a error ui
    // throw new Error('Error');
    container.replaceChildren(...render(data));
  } catch (error) {
    if (!container.isConnected) return;
    const message = error instanceof ApiError ? error.message : 'Something went wrong';
    container.replaceChildren(
      createErrorBanner({
        message,
        size: errorSize,
        onRetry: () => {
          void mountAsyncSection(container, options);
        },
      }),
    );
  }
}
