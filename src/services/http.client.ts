export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public body?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  authHeader?: string | null;
  baseUrl?: string;
}

function stripTrailingSlash(url: string): string {
  return url.replace(/\/$/, '');
}

/**
 * Server-side fetch must use absolute URLs. Next.js rewrites only apply to
 * incoming browser requests, not to fetch() from Server Components / Route Handlers.
 */
function resolveServerServiceOrigin(path: string): string {
  if (path.startsWith('/catalog')) {
    return stripTrailingSlash(
      process.env.CATALOG_API_BASE ??
        process.env.CATALOG_PROXY_TARGET ??
        'http://localhost:8085',
    );
  }
  if (path.startsWith('/pricing')) {
    return stripTrailingSlash(
      process.env.PRICING_API_BASE ??
        process.env.PRICING_PROXY_TARGET ??
        'http://localhost:8081',
    );
  }
  if (path.startsWith('/party')) {
    return stripTrailingSlash(
      process.env.PARTY_API_BASE ??
        process.env.PARTY_PROXY_TARGET ??
        'http://localhost:8082',
    );
  }
  if (path.startsWith('/orders')) {
    return stripTrailingSlash(
      process.env.ORDERS_API_BASE ??
        process.env.ORDERS_PROXY_TARGET ??
        'http://localhost:8083',
    );
  }
  if (path.startsWith('/facility')) {
    return stripTrailingSlash(
      process.env.FACILITY_API_BASE ??
        process.env.FACILITY_PROXY_TARGET ??
        'http://localhost:8084',
    );
  }
  if (path.startsWith('/api')) {
    return stripTrailingSlash(process.env.NEXT_PUBLIC_APP_URL?.trim() || 'http://localhost:3000');
  }
  return stripTrailingSlash(process.env.NEXT_PUBLIC_APP_URL?.trim() || 'http://localhost:3000');
}

function resolveRequestUrl(path: string, override?: string): string {
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  if (override) {
    return `${stripTrailingSlash(override)}${path}`;
  }

  // Browser: relative paths are proxied by next.config rewrites
  if (typeof window !== 'undefined') {
    return path;
  }

  // Server: call microservices directly
  return `${resolveServerServiceOrigin(path)}${path}`;
}

export async function httpClient<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, authHeader, baseUrl, headers: customHeaders, ...rest } = options;
  const url = resolveRequestUrl(path, baseUrl);

  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(customHeaders as Record<string, string>),
  };

  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  if (authHeader) {
    headers['X-User'] = authHeader;
  }

  const response = await fetch(url, {
    ...rest,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    cache: rest.cache ?? (rest.method === 'GET' ? 'no-store' : undefined),
  }).catch((error: unknown) => {
    const hint =
      typeof window === 'undefined'
        ? ' (server-side — ensure catalog/pricing services are running and CATALOG_API_BASE is set)'
        : '';
    throw new ApiError(
      `Network error calling ${url}${hint}: ${error instanceof Error ? error.message : String(error)}`,
      503,
    );
  });

  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try {
      const errBody = await response.json();
      // Spring Boot often sets error="Forbidden" and message=<detail>
      if (errBody?.message && String(errBody.message) !== String(errBody.status)) {
        message = String(errBody.message);
      } else if (errBody?.error) {
        message = String(errBody.error);
      }
    } catch {
      // ignore
    }
    throw new ApiError(message, response.status);
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export function getServiceAuthHeader(): string {
  if (typeof window !== 'undefined') {
    return '';
  }
  return process.env.CATALOG_SERVICE_AUTH_HEADER ?? 'admin:ADMIN,FULLADMIN';
}
