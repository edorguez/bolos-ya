const API_URL = import.meta.env.VITE_GO_BACKEND_URL || 'http://localhost:8080/api/v1';

function headers(sessionToken?: string, userId?: string): Record<string, string> {
  const h: Record<string, string> = { 'Content-Type': 'application/json' }
  if (sessionToken) h['Authorization'] = `Bearer ${sessionToken}`
  if (userId) h['X-User-ID'] = userId
  return h
}

async function request<T>(method: string, path: string, sessionToken?: string, userId?: string, body?: unknown): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers: headers(sessionToken, userId),
    body: body ? JSON.stringify(body) : undefined,
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: response.statusText }))
    throw new Error(err.error || 'Server error')
  }

  return response.json()
}

export async function apiGet<T>(
  path: string,
  sessionToken?: string,
  userId?: string,
): Promise<T> {
  return request<T>('GET', path, sessionToken, userId)
}

export async function apiPost<T>(
  path: string,
  sessionToken?: string,
  userId?: string,
  body?: unknown,
): Promise<T> {
  return request<T>('POST', path, sessionToken, userId, body)
}

export async function apiPut<T>(
  path: string,
  sessionToken?: string,
  userId?: string,
  body?: unknown,
): Promise<T> {
  return request<T>('PUT', path, sessionToken, userId, body)
}

export async function apiDelete<T>(
  path: string,
  sessionToken?: string,
  userId?: string,
): Promise<T> {
  return request<T>('DELETE', path, sessionToken, userId)
}
