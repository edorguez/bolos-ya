const API_URL = import.meta.env.VITE_GO_BACKEND_URL || 'http://localhost:8080/api/v1';
const API_KEY = import.meta.env.VITE_INTERNAL_API_KEY || '';

export async function apiGet<T>(
  path: string,
  sessionToken?: string,
  userId?: string,
): Promise<T> {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${API_KEY}`,
    'Content-Type': 'application/json',
  };

  if (sessionToken) {
    headers['X-Session-Token'] = sessionToken;
  }
  if (userId) {
    headers['X-User-ID'] = userId;
  }

  const response = await fetch(`${API_URL}${path}`, { headers });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(err.error || 'Server error');
  }

  return response.json();
}
