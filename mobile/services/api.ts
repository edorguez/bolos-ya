import * as SecureStore from 'expo-secure-store';
import { getGoBackendUrl } from '../lib/env';

const GO_BACKEND_URL = getGoBackendUrl();
const STORAGE_KEY = 'better-auth_cookie';
const DEFAULT_TIMEOUT_MS = 15_000;
const MAX_RETRIES = 2;

let cachedSessionToken: string | null = null;
let sessionTokenPromise: Promise<string | null> | null = null;

async function getSessionToken(): Promise<string | null> {
  if (cachedSessionToken !== null) return cachedSessionToken;
  if (sessionTokenPromise) return sessionTokenPromise;

  sessionTokenPromise = (async () => {
    try {
      const raw = await SecureStore.getItemAsync(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        const token = parsed['better-auth.session_token']?.value;
        if (token) {
          cachedSessionToken = token;
          return token;
        }
      }
    } catch {
      // Proceed without session JWT
    }
    return null;
  })().finally(() => {
    sessionTokenPromise = null;
  });

  return sessionTokenPromise;
}

export function clearSessionTokenCache(): void {
  cachedSessionToken = null;
  sessionTokenPromise = null;
}

export async function getStoredSessionToken(): Promise<string | null> {
  return getSessionToken();
}

async function buildHeaders(userId?: string): Promise<Record<string, string>> {
  const sessionToken = await getSessionToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (sessionToken) {
    headers['Authorization'] = `Bearer ${sessionToken}`;
  }

  if (userId) {
    headers['X-User-ID'] = userId;
  }

  return headers;
}

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function fetchWithTimeout(
  input: RequestInfo,
  init: RequestInit,
  timeoutMs: number
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(input, { ...init, signal: controller.signal });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

async function apiFetch<T>(
  path: string,
  options: { method?: string; userId?: string; body?: unknown; retries?: number } = {}
): Promise<T> {
  const { method = 'GET', userId, body } = options;
  const maxRetries = options.retries ?? MAX_RETRIES;

  const headers = await buildHeaders(userId);

  const fetchInit: RequestInit = {
    method,
    headers,
  };

  if (body && method !== 'GET') {
    fetchInit.body = JSON.stringify(body);
  }

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetchWithTimeout(
        `${GO_BACKEND_URL}${path}`,
        fetchInit,
        DEFAULT_TIMEOUT_MS
      );

      if (!response.ok) {
        const err = await response.json().catch(() => ({ error: response.statusText }));
        throw new ApiError(err.error || 'Error del servidor', response.status);
      }

      return response.json();
    } catch (err) {
      const isLastAttempt = attempt === maxRetries;
      const isNetworkError =
        err instanceof TypeError || (err instanceof ApiError && err.status >= 500);
      const shouldRetry = isNetworkError && !isLastAttempt;

      if (shouldRetry) {
        const delay = Math.min(1000 * Math.pow(2, attempt), 4000);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }

      throw err;
    }
  }

  throw new Error('Unreachable');
}

export async function apiGet<T>(path: string, userId?: string): Promise<T> {
  return apiFetch<T>(path, { method: 'GET', userId });
}

export async function apiPost<T>(path: string, userId?: string, body?: unknown): Promise<T> {
  return apiFetch<T>(path, { method: 'POST', userId, body });
}

export async function apiPut<T>(path: string, userId?: string, body?: unknown): Promise<T> {
  return apiFetch<T>(path, { method: 'PUT', userId, body });
}

export async function apiDelete<T>(path: string, userId?: string): Promise<T> {
  return apiFetch<T>(path, { method: 'DELETE', userId });
}
