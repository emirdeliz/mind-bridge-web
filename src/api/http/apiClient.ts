export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

type ApiRequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  query?: Record<string, string | boolean | number | undefined>;
};

const buildProxyUrl = (path: string, query?: ApiRequestOptions['query']): string => {
  const normalizedPath = path.startsWith('/') ? path.slice(1) : path;
  const url = new URL(
    `/api/backend/${normalizedPath}`,
    typeof window !== 'undefined' ? window.location.origin : 'http://localhost'
  );

  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value === undefined || value === '') {
        return;
      }
      url.searchParams.set(key, String(value));
    });
  }

  return url.pathname + url.search;
};

export const apiRequest = async <T>(
  path: string,
  options: ApiRequestOptions = {}
): Promise<T> => {
  if (typeof window === 'undefined') {
    throw new Error('apiRequest is browser-only; use serverApiRequest on the server');
  }

  const { method = 'GET', body, query } = options;
  const url = buildProxyUrl(path, query);

  const headers: Record<string, string> = {
    Accept: 'application/json',
  };

  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(url, {
    method,
    headers,
    credentials: 'include',
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const payload = (await response.json().catch(() => ({}))) as {
    error?: string;
    message?: string;
  };

  if (!response.ok) {
    throw new ApiError(
      response.status,
      payload.error ?? payload.message ?? `Request failed (${response.status})`
    );
  }

  return payload as T;
};
