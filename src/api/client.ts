export const API_BASE_URL = 'https://faxb76kxra.execute-api.eu-central-1.amazonaws.com';

export class ApiError extends Error {
  readonly status: number;
  readonly retryAfter?: number; // сек., только для 429

  constructor(status: number, message: string, retryAfter?: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.retryAfter = retryAfter;
  }

  get isNetwork() {
    return this.status === 0;
  }
  get isRateLimit() {
    return this.status === 429;
  }
}

export function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError';
}

type Query = Record<string, string | number | boolean | null | undefined>;

interface RequestOptions {
  method?: 'GET' | 'POST';
  query?: Query;
  body?: unknown;
  signal?: AbortSignal;
}

function buildQuery(query?: Query): string {
  if (!query) return '';
  const parameters = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null && value !== '') {
      parameters.set(key, String(value));
    }
  }
  const string_ = parameters.toString();
  return string_ ? `?${string_}` : '';
}

export async function makeRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', query, body, signal } = options;

  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}${buildQuery(query)}`, {
      method,
      signal,
      headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch (error) {
    if (isAbortError(error)) throw error;
    throw new ApiError(0, 'Нет соединения с сервером');
  }

  let payload;

  try {
    payload = await response.json();
  } catch {
    payload = undefined;
  }

  if (!response.ok) {
    const message =
      typeof payload?.error === 'string' ? payload.error : response.statusText || 'Ошибка запроса';

    const retryAfter =
      response.status === 429
        ? Number(message.match(/(\d+)\s*second/i)?.[1]) || undefined
        : undefined;

    throw new ApiError(response.status, message, retryAfter);
  }

  return payload as T;
}
