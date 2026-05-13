import { apiGet, apiPost } from './api';
import type { ApiCartDetailResponse } from '../types';

export interface CreateCartParams {
  supermarketId?: string;
  newSupermarket?: { name: string };
  budgetBs: number;
  budgetUsd: number;
}

export interface CreateCartResponse {
  id: string;
  supermarketId: string;
  userId: string;
  isActive: boolean;
  budgetBs: number;
  budgetUsd: number;
  totalEstimatedBs: number | null;
  totalEstimatedUsd: number | null;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export async function getCartDetail(
  cartId: string,
  userId?: string
): Promise<ApiCartDetailResponse> {
  const response = await apiGet<ApiResponse<ApiCartDetailResponse>>(`/carts/${cartId}`, userId);

  if (!response.success) {
    throw new Error('Error al obtener el carrito');
  }

  return response.data;
}

export async function createCart(
  params: CreateCartParams,
  userId?: string
): Promise<CreateCartResponse> {
  const body: Record<string, unknown> = {
    budgetBs: params.budgetBs,
    budgetUsd: params.budgetUsd,
  };

  if (params.supermarketId) {
    body.supermarketId = params.supermarketId;
  } else if (params.newSupermarket) {
    body.newSupermarket = { name: params.newSupermarket.name };
  }

  const response = await apiPost<ApiResponse<CreateCartResponse>>('/carts', userId, body);

  if (!response.success) {
    throw new Error('Error al crear el carrito');
  }

  return response.data;
}
