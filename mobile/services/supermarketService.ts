import { apiGet } from './api';
import type { ApiSupermarketResponse } from '../types';

export interface SupermarketOption {
  id: string;
  name: string;
  icon: string;
  selected: boolean;
}

const ICON_POOL: readonly string[] = ['storefront', 'store', 'shopping-cart', 'local-mall'];

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export async function getAllSupermarkets(userId?: string): Promise<SupermarketOption[]> {
  const response = await apiGet<ApiResponse<ApiSupermarketResponse[]>>('/supermarkets', userId);

  if (!response.success || !Array.isArray(response.data)) {
    throw new Error('Error al cargar supermercados');
  }

  const supermarkets = response.data.map((item, index) => ({
    id: item.id,
    name: item.name,
    icon: ICON_POOL[index % ICON_POOL.length],
    selected: false,
  }));

  supermarkets.push({
    id: 'other',
    name: 'Otro',
    icon: 'add-circle',
    selected: false,
  });

  return supermarkets;
}
