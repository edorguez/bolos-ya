import { apiGet } from './api';
import type { ApiSupermarketResponse } from '../types';
import { getIconByIndex } from '../utils/iconUtils';

export interface SupermarketOption {
  id: string;
  name: string;
  icon: string;
  selected: boolean;
}

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
    icon: getIconByIndex(index),
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
