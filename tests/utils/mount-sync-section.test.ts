import { afterEach, describe, expect, it, vi } from 'vitest';

import { ApiError } from '../../src/api/client';
import { mountAsyncSection } from '../../src/utils/mount-sync-section';
import { createErrorBanner } from '../../src/components/error-banner';
import { showSnackbar } from '../../src/components/snackbar';

vi.mock('../../src/api/client', () => ({
  ApiError: class ApiError extends Error {
    readonly status: number;
    constructor(status: number, message: string) {
      super(message);
      this.name = 'ApiError';
      this.status = status;
    }
  },
}));

vi.mock('../../src/components/error-banner', () => ({
  createErrorBanner: vi.fn((options: { onRetry?: () => void }) => {
    const node = document.createElement('div');
    (node as unknown as { onRetry?: () => void }).onRetry = options.onRetry;
    return node;
  }),
}));

vi.mock('../../src/components/snackbar', () => ({ showSnackbar: vi.fn() }));

afterEach(() => {
  vi.clearAllMocks();
  document.body.replaceChildren();
});

describe('mountAsyncSection', () => {
  it('shows the skeleton, then renders the loaded data', async () => {
    const container = document.createElement('div');
    document.body.append(container);
    const renderedNode = document.createElement('p');
    const skeleton = vi.fn(() => [document.createElement('span')]);
    const render = vi.fn(() => [renderedNode]);

    await mountAsyncSection(container, {
      load: vi.fn().mockResolvedValue({ id: 1 }),
      render,
      skeleton,
    });

    expect(skeleton).toHaveBeenCalled();
    expect(render).toHaveBeenCalledWith({ id: 1 });
    expect(container.firstChild).toBe(renderedNode);
    expect(createErrorBanner).not.toHaveBeenCalled();
  });

  it('shows an ApiError message, notifies via snackbar, and retries successfully', async () => {
    const container = document.createElement('div');
    document.body.append(container);
    const render = vi.fn(() => [document.createElement('p')]);
    const load = vi
      .fn()
      .mockRejectedValueOnce(new ApiError(0, 'Error'))
      .mockResolvedValueOnce({ id: 2 });

    await mountAsyncSection(container, { load, render, skeleton: () => [], errorSize: 'default' });

    expect(createErrorBanner).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Error', size: 'default' }),
    );
    expect(showSnackbar).toHaveBeenCalledWith({ variant: 'error', message: 'Error' });

    const { onRetry } = vi.mocked(createErrorBanner).mock.calls[0][0] as { onRetry: () => void };
    onRetry();
    await vi.waitFor(() => expect(render).toHaveBeenCalledWith({ id: 2 }));
  });

  it('falls back to a generic message for non-ApiError failures', async () => {
    const container = document.createElement('div');
    document.body.append(container);

    await mountAsyncSection(container, {
      load: vi.fn().mockRejectedValue(new Error('network down')),
      render: vi.fn(),
      skeleton: () => [],
    });

    expect(createErrorBanner).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Failed to load data' }),
    );
  });

  it('logs and shows a generic banner when render() throws', async () => {
    const container = document.createElement('div');
    document.body.append(container);
    vi.spyOn(console, 'error').mockImplementation(() => {});

    await mountAsyncSection(container, {
      load: vi.fn().mockResolvedValue({}),
      render: () => {
        throw new Error('boom');
      },
      skeleton: () => [],
    });

    expect(console.error).toHaveBeenCalledWith('Render failed', expect.any(Error));
    expect(createErrorBanner).toHaveBeenCalledWith({
      message: 'Failed to display data',
      size: 'default',
    });
  });

  it('does nothing once the container has left the DOM, on both failure and success', async () => {
    const rejectedContainer = document.createElement('div');
    await mountAsyncSection(rejectedContainer, {
      load: vi.fn().mockRejectedValue(new ApiError(0, 'Error')),
      render: vi.fn(),
      skeleton: () => [],
    });
    expect(createErrorBanner).not.toHaveBeenCalled();
    expect(showSnackbar).not.toHaveBeenCalled();

    const resolvedContainer = document.createElement('div');
    const render = vi.fn();
    await mountAsyncSection(resolvedContainer, {
      load: vi.fn().mockResolvedValue({}),
      render,
      skeleton: () => [],
    });
    expect(render).not.toHaveBeenCalled();
  });
});
