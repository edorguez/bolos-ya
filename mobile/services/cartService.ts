import { apiGet, apiPost, apiPut, apiDelete } from './api';
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

export interface AddCartProductParams {
  cartId: string;
  supermarketId: string;
  name: string;
  barcode?: string | null;
  isWeightBased?: boolean;
  priceUsd: number;
  priceBs: number;
  priceBcv?: number;
  imageUrl?: string | null;
  quantity: number;
  isManualEntry?: boolean;
}

export interface UpdateCartProductParams {
  cartId: string;
  name: string;
  barcode?: string | null;
  isWeightBased?: boolean;
  priceUsd: number;
  priceBs: number;
  priceBcv?: number;
  imageUrl?: string | null;
  quantity: number;
}

export interface UpdateCartProductQuantityParams {
  cartProductId: string;
  cartId: string;
  quantity: number;
}

export interface CartProductResponse {
  id: string;
  cartId: string;
  productId: string;
  name: string;
  priceBs: number;
  priceUsd: number;
  imageUrl: string | null;
  quantity: number;
  isManualEntry: boolean;
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

export async function addCartProduct(
  params: AddCartProductParams,
  userId?: string
): Promise<CartProductResponse> {
  const body: Record<string, unknown> = {
    cartId: params.cartId,
    supermarketId: params.supermarketId,
    name: params.name,
    priceUsd: Math.round(params.priceUsd),
    priceBs: Math.round(params.priceBs),
    priceBcv: params.priceBcv !== undefined ? Math.round(params.priceBcv) : 0,
    quantity: params.quantity,
    isManualEntry: params.isManualEntry ?? true,
  };

  if (params.barcode != null) {
    body.barcode = params.barcode;
  }

  if (params.isWeightBased !== undefined) {
    body.isWeightBased = params.isWeightBased;
  }

  if (params.imageUrl != null) {
    body.imageUrl = params.imageUrl;
  }

  const response = await apiPost<ApiResponse<CartProductResponse>>('/cart-products', userId, body);

  if (!response.success) {
    throw new Error('Error al agregar producto');
  }

  return response.data;
}

export async function updateCartProduct(
  cartProductId: string,
  params: UpdateCartProductParams,
  userId?: string
): Promise<CartProductResponse> {
  const body: Record<string, unknown> = {
    cartId: params.cartId,
    name: params.name,
    priceUsd: Math.round(params.priceUsd),
    priceBs: Math.round(params.priceBs),
    priceBcv: params.priceBcv !== undefined ? Math.round(params.priceBcv) : 0,
    quantity: params.quantity,
  };

  if (params.barcode != null) {
    body.barcode = params.barcode;
  }

  if (params.isWeightBased !== undefined) {
    body.isWeightBased = params.isWeightBased;
  }

  if (params.imageUrl != null) {
    body.imageUrl = params.imageUrl;
  }

  const response = await apiPut<ApiResponse<CartProductResponse>>(
    `/cart-products/${cartProductId}`,
    userId,
    body
  );

  if (!response.success) {
    throw new Error('Error al actualizar producto');
  }

  return response.data;
}

export async function updateCartProductQuantity(
  cartProductId: string,
  params: UpdateCartProductQuantityParams,
  userId?: string
): Promise<CartProductResponse> {
  const body: Record<string, unknown> = {
    cartProductId: params.cartProductId,
    cartId: params.cartId,
    quantity: params.quantity,
  };

  const response = await apiPut<ApiResponse<CartProductResponse>>(
    `/cart-products/${cartProductId}/quantity`,
    userId,
    body
  );

  if (!response.success) {
    throw new Error('Error al actualizar cantidad');
  }

  return response.data;
}

export async function deleteCartProduct(cartProductId: string, userId?: string): Promise<void> {
  const response = await apiDelete<ApiResponse<void>>(`/cart-products/${cartProductId}`, userId);

  if (!response.success) {
    throw new Error('Error al eliminar producto');
  }
}
