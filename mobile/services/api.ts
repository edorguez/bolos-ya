import * as SecureStore from 'expo-secure-store';

const GO_BACKEND_URL = process.env.EXPO_PUBLIC_GO_BACKEND_URL || 'http://localhost:8080/api/v1';
const INTERNAL_API_KEY = process.env.EXPO_PUBLIC_INTERNAL_API_KEY || '';
const STORAGE_KEY = 'better-auth_cookie';

export async function apiGet<T>(path: string, userId?: string): Promise<T> {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${INTERNAL_API_KEY}`,
    'Content-Type': 'application/json',
  };

  if (userId) {
    headers['X-User-ID'] = userId;
  }

  try {
    const raw = await SecureStore.getItemAsync(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const token = parsed['better-auth.session_token']?.value;
      if (token) {
        headers['X-Session-Token'] = token;
      }
    }
  } catch {
    // Proceed without session JWT
  }

  const response = await fetch(`${GO_BACKEND_URL}${path}`, { headers });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(err.error || 'Error del servidor');
  }

  return response.json();
}
