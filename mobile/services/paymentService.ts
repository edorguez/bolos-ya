import { apiGet, apiPost } from './api';

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

export interface CreatePaymentResponse {
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
  isConfirmed: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export async function createPayment(
  params: CreatePaymentParams,
  userId?: string
): Promise<CreatePaymentResponse> {
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

  const response = await apiPost<ApiResponse<CreatePaymentResponse>>('/payments', userId, body);

  if (!response.success) {
    throw new Error('Error al procesar el pago');
  }

  return response.data;
}

export async function checkPendingPayment(userId: string): Promise<{ hasPending: boolean }> {
  const response = await apiGet<ApiResponse<{ hasPending: boolean }>>('/payments/pending', userId);

  if (!response.success) {
    throw new Error('Error al verificar pagos pendientes');
  }

  return response.data;
}
