import type { ApiResponse, PaymentResponse } from '../types/payment'

const API_URL = import.meta.env.VITE_GO_BACKEND_URL || 'http://localhost:8080/api/v1'

export async function getAllPayments(
  sessionToken: string,
  userId?: string,
): Promise<PaymentResponse[]> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (sessionToken) {
    headers['Authorization'] = `Bearer ${sessionToken}`
  }
  if (userId) {
    headers['X-User-ID'] = userId
  }

  const response = await fetch(`${API_URL}/payments`, { headers })

  if (!response.ok) {
    const err = await response
      .json()
      .catch(() => ({ error: response.statusText }))
    throw new Error(err.error || 'Error del servidor')
  }

  const result: ApiResponse<PaymentResponse[]> = await response.json()

  if (!result.success) {
    throw new Error('Error al cargar pagos')
  }

  return result.data
}
