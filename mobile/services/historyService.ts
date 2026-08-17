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
  let serverCarts: ApiCartResponse[] = [];

  try {
    let path = '/carts';
    if (limit && limit > 0) {
      path += `?limit=${limit}`;
    }

    const response = await apiGet<ApiResponse<ApiCartResponse[]>>(path, userId);

    if (response.success && Array.isArray(response.data)) {
      serverCarts = response.data.map(transformCartResponse);

      for (const cart of serverCarts) {
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
    } else {
      throw new Error('Error al obtener el historial');
    }
  } catch {
    serverCarts = [];
  }

  const localCarts = await cartRepository.getAll(userId);
  const serverIds = new Set(serverCarts.map(cart => cart.id));

  const merged: ApiCartResponse[] = [...serverCarts];
  for (const local of localCarts) {
    if (serverIds.has(local.id)) continue;
    merged.push({
      id: local.id,
      supermarketId: local.supermarketId,
      supermarketName: local.supermarketName,
      userId: local.userId || userId || '',
      isActive: local.isActive,
      budgetBs: local.budgetBs,
      budgetUsd: local.budgetUsd,
      totalEstimatedBs: local.totalEstimatedBs,
      totalEstimatedUsd: local.totalEstimatedUsd,
      createdAt: local.createdAt,
      updatedAt: local.updatedAt,
    });
  }

  const localById = new Map(localCarts.map(cart => [cart.id, cart]));
  const result = merged.map(cart => {
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

  result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return limit ? result.slice(0, limit) : result;
}
