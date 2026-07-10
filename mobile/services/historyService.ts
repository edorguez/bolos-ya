import { apiGet } from './api';
import { cartRepository } from '../lib/local/repositories/cartRepository';
import type { ApiCartResponse } from '../types';

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export async function getCarts(userId?: string, limit?: number): Promise<ApiCartResponse[]> {
  try {
    let path = '/carts';
    if (limit && limit > 0) {
      path += `?limit=${limit}`;
    }

    const response = await apiGet<ApiResponse<ApiCartResponse[]>>(path, userId);

    if (response.success && Array.isArray(response.data)) {
      for (const cart of response.data) {
        await cartRepository.upsert({
          id: cart.id,
          supermarketId: cart.supermarketId,
          supermarketName: cart.supermarketName,
          userId,
          isActive: cart.isActive,
          budgetBs: cart.budgetBs,
          budgetUsd: cart.budgetUsd,
        });
      }
      return response.data;
    }

    throw new Error('Error al obtener el historial');
  } catch {
    const localCarts = await cartRepository.getAll(userId);

    const apiCarts: ApiCartResponse[] = localCarts.map(cart => ({
      id: cart.id,
      supermarketId: cart.supermarketId,
      supermarketName: cart.supermarketName,
      userId: cart.userId || userId || '',
      isActive: cart.isActive,
      budgetBs: cart.budgetBs,
      budgetUsd: cart.budgetUsd,
      totalEstimatedBs: cart.totalEstimatedBs,
      totalEstimatedUsd: cart.totalEstimatedUsd,
      createdAt: cart.createdAt,
      updatedAt: cart.updatedAt,
    }));

    return limit ? apiCarts.slice(0, limit) : apiCarts;
  }
}
