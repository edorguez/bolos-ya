import { apiGet, apiPost } from './api';

export const PENDING_STATUS_ID = 'a1111111-1111-4a11-9a11-111111111111';

export interface CreatePaymentParams {
  numberOfMonths: number;
  referenceNumber: string;
  bankName: string;
  amountBs: number;
  amountUsd: number;
  priceBcv: number;
  identification: string;
  isDiscount: boolean;
  paidAt: string;
}

export interface PaymentUser {
  id: string;
  email: string;
  authProvider: string;
  isPremium: boolean;
  isAnonymous: boolean;
  premiumUntil?: string | null;
}

export interface PaymentStatus {
  id: string;
  name: string;
  description: string;
}

export interface RejectionReason {
  id: string;
  reason: string;
}

export interface PaymentResponse {
  id: string;
  userId: string;
  numberOfMonths: number;
  referenceNumber: string;
  bankName: string;
  amountBs: number;
  amountUsd: number;
  priceBcv: number;
  identification: string;
  isDiscount: boolean;
  paidAt: string;
  statusId: string;
  rejectionReasonId?: string | null;
  rejectionMessage?: string | null;
  approvedAt?: string | null;
  rejectedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  user: PaymentUser;
  paymentStatus: PaymentStatus;
  rejectionReason?: RejectionReason | null;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export async function createPayment(
  params: CreatePaymentParams,
  userId?: string
): Promise<PaymentResponse> {
  const body: Record<string, unknown> = {
    numberOfMonths: params.numberOfMonths,
    referenceNumber: params.referenceNumber,
    bankName: params.bankName,
    amountBs: params.amountBs,
    amountUsd: params.amountUsd,
    priceBcv: params.priceBcv,
    identification: params.identification,
    isDiscount: params.isDiscount,
    paidAt: params.paidAt,
  };

  const response = await apiPost<ApiResponse<PaymentResponse>>('/payments', userId, body);

  if (!response.success) {
    throw new Error('Error al procesar el pago');
  }

  return response.data;
}

export async function getPaymentsByUser(
  userId: string,
  statusId?: string
): Promise<PaymentResponse[]> {
  const query = statusId ? `?statusId=${statusId}` : '';
  const response = await apiGet<ApiResponse<PaymentResponse[]>>(
    `/payments/by-user/${userId}${query}`,
    userId,
  );

  if (!response.success) {
    throw new Error('Error al obtener pagos');
  }

  return response.data;
}
