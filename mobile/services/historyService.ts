import { apiGet } from './api';
import { cartRepository } from '../lib/local/repositories/cartRepository';
import type { ApiCartResponse, ApiResponse } from '../types';
import { fromCents } from '../utils/priceUtils';

function transformCartResponse(cart: ApiCartResponse): ApiCartResponse {
  return {
    ...cart,
    budgetBs: fromCents(cart.budgetBs),
    budgetUsd: fromCents(cart.budgetUsd),
    totalEstimatedBs: cart.totalEstimatedBs !== null ? fromCents(cart.totalEstimatedBs) : null,
    totalEstimatedUsd: cart.totalEstimatedUsd !== null ? fromCents(cart.totalEstimatedUsd) : null,
  };
}

export async function getCarts(userId?: string, limit?: number): Promise<ApiCartResponse[]> {
  try {
    let path = '/carts';
    if (limit && limit > 0) {
      path += `?limit=${limit}`;
    }

    const response = await apiGet<ApiResponse<ApiCartResponse[]>>(path, userId);

    if (response.success && Array.isArray(response.data)) {
      const transformed = response.data.map(transformCartResponse);

      for (const cart of transformed) {
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

      const localCarts = await cartRepository.getAll(userId);
      const localById = new Map(localCarts.map(cart => [cart.id, cart]));

      return transformed.map(cart => {
        const local = localById.get(cart.id);
        if (
          local &&
          local.totalEstimatedBs !== null &&
          (cart.totalEstimatedBs === null || cart.totalEstimatedUsd === null)
        ) {
          return {
            ...cart,
            totalEstimatedBs: cart.totalEstimatedBs ?? local.totalEstimatedBs,
            totalEstimatedUsd: cart.totalEstimatedUsd ?? local.totalEstimatedUsd,
          };
        }
        return cart;
      });
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
