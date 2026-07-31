import { apiGet } from './api';
import { supermarketRepository } from '../lib/local/repositories/supermarketRepository';
import type { ApiSupermarketResponse, ApiResponse } from '../types';
import { getIconByIndex } from '../utils/iconUtils';

export interface SupermarketOption {
  id: string;
  name: string;
  icon: string;
  selected: boolean;
}

export async function getAllSupermarkets(userId?: string): Promise<SupermarketOption[]> {
  try {
    const response = await apiGet<ApiResponse<ApiSupermarketResponse[]>>('/supermarkets', userId);

    if (response.success && Array.isArray(response.data)) {
      await supermarketRepository.cacheAll(
        response.data.map(item => ({
          id: item.id,
          name: item.name,
          isCustom: item.isCustom,
          imageUrl: item.imageUrl,
          userId: item.userId,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
        }))
      );

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

    throw new Error('Error al cargar supermercados');
  } catch {
    const localSupermarkets = await supermarketRepository.getAll();

    const options: SupermarketOption[] = localSupermarkets.map((item, index) => ({
      id: item.id,
      name: item.name,
      icon: getIconByIndex(index),
      selected: false,
    }));

    options.push({
      id: 'other',
      name: 'Otro',
      icon: 'add-circle',
      selected: false,
    });

    return options;
  }
}
