import type { ApiResponse, PaymentResponse, PaginatedPayments, RejectionReason, PaymentStatus } from '../types/payment'

const API_URL = import.meta.env.VITE_GO_BACKEND_URL || 'http://localhost:8080/api/v1'

function headers(sessionToken: string, userId?: string): Record<string, string> {
  const h: Record<string, string> = { 'Content-Type': 'application/json' }
  if (sessionToken) h['Authorization'] = `Bearer ${sessionToken}`
  if (userId) h['X-User-ID'] = userId
  return h
}

export interface PaymentsQuery {
  page?: number
  pageSize?: number
  sortBy?: string
  sortDir?: 'asc' | 'desc'
}

export async function getAllPayments(
  sessionToken: string,
  userId?: string,
  query?: PaymentsQuery,
): Promise<PaginatedPayments> {
  const params = new URLSearchParams()
  if (query?.page) params.set('page', String(query.page))
  if (query?.pageSize) params.set('pageSize', String(query.pageSize))
  if (query?.sortBy) params.set('sortBy', query.sortBy)
  if (query?.sortDir) params.set('sortDir', query.sortDir)

  const qs = params.toString()
  const url = `${API_URL}/payments${qs ? `?${qs}` : ''}`

  const response = await fetch(url, { headers: headers(sessionToken, userId) })
  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: response.statusText }))
    throw new Error(err.error || 'Error del servidor')
  }
  const result: ApiResponse<PaginatedPayments> = await response.json()
  if (!result.success) throw new Error('Error al cargar pagos')
  return result.data
}

export async function updatePaymentStatus(
  sessionToken: string,
  userId: string,
  paymentId: string,
  payload: { statusId: string; rejectionReasonId?: string | null; rejectionMessage?: string | null },
): Promise<PaymentResponse> {
  const response = await fetch(`${API_URL}/payments/${paymentId}`, {
    method: 'PUT',
    headers: headers(sessionToken, userId),
    body: JSON.stringify(payload),
  })
  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: response.statusText }))
    throw new Error(err.error || 'Error del servidor')
  }
  const result: ApiResponse<PaymentResponse> = await response.json()
  if (!result.success) throw new Error('Error al actualizar pago')
  return result.data
}

export async function getRejectionReasons(
  sessionToken: string,
  userId: string,
): Promise<RejectionReason[]> {
  const response = await fetch(`${API_URL}/rejection-reasons`, { headers: headers(sessionToken, userId) })
  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: response.statusText }))
    throw new Error(err.error || 'Error del servidor')
  }
  const result: ApiResponse<RejectionReason[]> = await response.json()
  if (!result.success) throw new Error('Error al cargar motivos de rechazo')
  return result.data
}

export async function getPaymentStatuses(
  sessionToken: string,
  userId: string,
): Promise<PaymentStatus[]> {
  const response = await fetch(`${API_URL}/payment-statuses`, { headers: headers(sessionToken, userId) })
  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: response.statusText }))
    throw new Error(err.error || 'Error del servidor')
  }
  const result: ApiResponse<PaymentStatus[]> = await response.json()
  if (!result.success) throw new Error('Error al cargar estados de pago')
  return result.data
}
