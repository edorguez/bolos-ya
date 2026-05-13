import { apiGet } from './api';
import type { ApiCartResponse } from '../types';

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export async function getCarts(userId?: string, limit?: number): Promise<ApiCartResponse[]> {
  let path = '/carts';
  if (limit && limit > 0) {
    path += `?limit=${limit}`;
  }

  const response = await apiGet<ApiResponse<ApiCartResponse[]>>(path, userId);

  if (!response.success || !Array.isArray(response.data)) {
    throw new Error('Error al obtener el historial');
  }

  return response.data;
}
