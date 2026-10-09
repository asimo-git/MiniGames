import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { API_BASE_URL, ApiError, makeRequest } from '../../src/api/client';

const fetchMock = vi.fn<typeof fetch>();

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status });
}

describe('makeRequest', () => {
  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('sends a GET with a filtered query and returns the payload', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ ok: true }));

    const result = await makeRequest('/games', {
      query: { a: 1, b: false, c: undefined, d: null, e: '' },
    });

    expect(result).toEqual({ ok: true });
    expect(fetchMock).toHaveBeenCalledWith(
      `${API_BASE_URL}/games?a=1&b=false`,
      expect.objectContaining({ method: 'GET', headers: undefined, body: undefined }),
    );
  });

  it('sends a JSON body with POST and accepts an external signal', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ id: 1 }));

    await makeRequest('/comments', {
      method: 'POST',
      body: { text: 'hi' },
      signal: new AbortController().signal,
    });

    expect(fetchMock).toHaveBeenCalledWith(
      `${API_BASE_URL}/comments`,
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: 'hi' }),
      }),
    );
  });

  describe('network failures', () => {
    it('wraps a network error into ApiError with status 0', async () => {
      fetchMock.mockRejectedValue(new TypeError('failed'));

      const error = await makeRequest('/x').catch((e: unknown) => e);

      expect(error).toBeInstanceOf(ApiError);
      expect(error).toMatchObject({ status: 0, message: 'No connection to the server' });
      expect((error as ApiError).isNetwork).toBe(true);
    });

    it('reports a timeout when the timeout signal has fired', async () => {
      vi.spyOn(AbortSignal, 'timeout').mockReturnValue(AbortSignal.abort());
      fetchMock.mockRejectedValue(new Error('boom'));

      await expect(makeRequest('/x')).rejects.toMatchObject({
        status: 0,
        message: 'The server is taking too long to respond',
      });
    });
  });

  describe('responses', () => {
    it('throws on invalid JSON', async () => {
      fetchMock.mockResolvedValue(new Response('not json', { status: 200 }));

      await expect(makeRequest('/x')).rejects.toMatchObject({
        status: 200,
        message: 'Invalid server response',
      });
    });

    it('uses the server error message', async () => {
      fetchMock.mockResolvedValue(jsonResponse({ error: 'Not found' }, 404));

      await expect(makeRequest('/x')).rejects.toMatchObject({
        name: 'ApiError',
        status: 404,
        message: 'Not found',
      });
    });

    it('falls back to statusText, then to a default message', async () => {
      fetchMock.mockResolvedValueOnce(
        new Response('null', { status: 500, statusText: 'Server Error' }),
      );
      await expect(makeRequest('/x')).rejects.toMatchObject({ message: 'Server Error' });

      fetchMock.mockResolvedValueOnce(jsonResponse({ error: 42 }, 500));
      await expect(makeRequest('/x')).rejects.toMatchObject({ message: 'Request error' });
    });

    it('extracts retryAfter from a 429 message', async () => {
      fetchMock.mockResolvedValue(jsonResponse({ error: 'Try again in 30 seconds' }, 429));

      const error = await makeRequest('/x').catch((e: unknown) => e);

      expect(error).toMatchObject({ status: 429, retryAfter: 30 });
      expect((error as ApiError).isRateLimit).toBe(true);
    });
  });
});
