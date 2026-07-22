import { apiGet, apiPut } from '../lib/api'
import type { ApiResponse, PaymentResponse, PaginatedPayments, RejectionReason, PaymentStatus } from '../types/payment'

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
  const path = `/payments${qs ? `?${qs}` : ''}`

  const result = await apiGet<ApiResponse<PaginatedPayments>>(path, sessionToken, userId)
  if (!result.success) throw new Error('Error al cargar pagos')
  return result.data
}

export async function updatePaymentStatus(
  sessionToken: string,
  userId: string,
  paymentId: string,
  payload: { statusId: string; rejectionReasonId?: string | null; rejectionMessage?: string | null },
): Promise<PaymentResponse> {
  const result = await apiPut<ApiResponse<PaymentResponse>>(`/payments/${paymentId}`, sessionToken, userId, payload)
  if (!result.success) throw new Error('Error al actualizar pago')
  return result.data
}

export async function getRejectionReasons(
  sessionToken: string,
  userId: string,
): Promise<RejectionReason[]> {
  const result = await apiGet<ApiResponse<RejectionReason[]>>('/rejection-reasons', sessionToken, userId)
  if (!result.success) throw new Error('Error al cargar motivos de rechazo')
  return result.data
}

export async function getPaymentStatuses(
  sessionToken: string,
  userId: string,
): Promise<PaymentStatus[]> {
  const result = await apiGet<ApiResponse<PaymentStatus[]>>('/payment-statuses', sessionToken, userId)
  if (!result.success) throw new Error('Error al cargar estados de pago')
  return result.data
}
