const API_URL = import.meta.env.VITE_GO_BACKEND_URL || 'http://localhost:8080/api/v1';

export async function apiGet<T>(
  path: string,
  sessionToken?: string,
  userId?: string,
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (sessionToken) {
    headers['Authorization'] = `Bearer ${sessionToken}`;
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

export async function apiPost<T>(
  path: string,
  sessionToken?: string,
  userId?: string,
  body?: unknown,
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (sessionToken) {
    headers['Authorization'] = `Bearer ${sessionToken}`;
  }
  if (userId) {
    headers['X-User-ID'] = userId;
  }

  const response = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(err.error || 'Server error');
  }

  return response.json();
}
