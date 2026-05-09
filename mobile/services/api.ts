import * as SecureStore from 'expo-secure-store';

const GO_BACKEND_URL = process.env.EXPO_PUBLIC_GO_BACKEND_URL || 'http://localhost:8080/api/v1';
const STORAGE_KEY = 'better-auth_cookie';

async function getSessionToken(): Promise<string | null> {
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const raw = await SecureStore.getItemAsync(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        const token = parsed['better-auth.session_token']?.value;
        if (token) return token;
      }
    } catch {
      // Proceed without session JWT
    }
    if (attempt < 4) await new Promise(r => setTimeout(r, 50));
  }
  return null;
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

export async function apiGet<T>(path: string, userId?: string): Promise<T> {
  const headers = await buildHeaders(userId);

  const response = await fetch(`${GO_BACKEND_URL}${path}`, { headers });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(err.error || 'Error del servidor');
  }

  return response.json();
}

export async function apiPost<T>(path: string, userId?: string, body?: unknown): Promise<T> {
  const headers = await buildHeaders(userId);

  const response = await fetch(`${GO_BACKEND_URL}${path}`, {
    method: 'POST',
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(err.error || 'Error del servidor');
  }

  return response.json();
}
