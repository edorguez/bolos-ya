import { apiGet, apiPost } from './api';
import { cartRepository } from '../lib/local/repositories/cartRepository';
import { cartProductRepository } from '../lib/local/repositories/cartProductRepository';
import { syncService } from './syncService';
import { generateLocalId } from '../lib/local/database';
import type {
  ApiCartDetailResponse,
  ApiCartResponse,
  ApiCartProductResponse,
  ApiResponse,
} from '../types';
import { toCents, fromCents, transformPrices } from '../utils/priceUtils';

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

function transformCartDetail(response: ApiCartDetailResponse): ApiCartDetailResponse {
  return {
    ...response,
    budgetBs: fromCents(response.budgetBs),
    budgetUsd: fromCents(response.budgetUsd),
    totalEstimatedBs:
      response.totalEstimatedBs !== null ? fromCents(response.totalEstimatedBs) : null,
    totalEstimatedUsd:
      response.totalEstimatedUsd !== null ? fromCents(response.totalEstimatedUsd) : null,
    products: response.products.map(
      (p: ApiCartProductResponse) => transformPrices(p) as ApiCartProductResponse
    ),
  };
}

export async function getCartDetail(
  cartId: string,
  userId?: string
): Promise<ApiCartDetailResponse> {
  try {
    const response = await apiGet<ApiResponse<ApiCartDetailResponse>>(`/carts/${cartId}`, userId);
    if (response.success) {
      await cartRepository.upsert({
        id: response.data.id,
        supermarketId: response.data.supermarketId,
        supermarketName: response.data.supermarketName,
        userId,
        isActive: response.data.isActive,
        budgetBs: fromCents(response.data.budgetBs),
        budgetUsd: fromCents(response.data.budgetUsd),
      });

      for (const product of response.data.products) {
        await cartProductRepository.upsert({
          id: product.id,
          cartId: product.cartId,
          productId: product.productId,
          name: product.name,
          priceBs: fromCents(product.priceBs),
          priceUsd: fromCents(product.priceUsd),
          quantity: product.quantity,
          isManualEntry: product.isManualEntry,
          imageUrl: product.imageUrl,
        });
      }
    }
    return transformCartDetail(response.data);
  } catch {
    const localCart = await cartRepository.getById(cartId);
    if (localCart) {
      return {
        id: localCart.id,
        supermarketId: localCart.supermarketId,
        supermarketName: localCart.supermarketName,
        userId: localCart.userId || '',
        isActive: localCart.isActive,
        budgetBs: localCart.budgetBs,
        budgetUsd: localCart.budgetUsd,
        totalEstimatedBs: localCart.totalEstimatedBs,
        totalEstimatedUsd: localCart.totalEstimatedUsd,
        createdAt: localCart.createdAt,
        updatedAt: localCart.updatedAt,
        products: localCart.products.map(p => ({
          id: p.id,
          cartId: p.cartId,
          productId: p.productId || '',
          name: p.name,
          priceBs: p.priceBs,
          priceUsd: p.priceUsd,
          imageUrl: p.imageUrl,
          quantity: p.quantity,
          isManualEntry: p.isManualEntry,
          createdAt: p.createdAt,
          updatedAt: p.updatedAt,
        })),
      };
    }
    throw new Error('Error al obtener el carrito');
  }
}

export async function createCart(
  params: CreateCartParams,
  userId?: string
): Promise<CreateCartResponse> {
  const localCart = await cartRepository.upsert({
    supermarketId: params.supermarketId || generateLocalId(),
    supermarketName: params.newSupermarket?.name || "Plaza's",
    userId,
    budgetBs: params.budgetBs,
    budgetUsd: params.budgetUsd,
  });

  const now = new Date().toISOString();

  await syncService.enqueueAndSync(
    'carts',
    'INSERT',
    localCart.id,
    {
      id: localCart.id,
      supermarketId: params.supermarketId,
      newSupermarket: params.newSupermarket,
      budgetBs: toCents(params.budgetBs),
      budgetUsd: toCents(params.budgetUsd),
      budgetBsRaw: params.budgetBs,
      budgetUsdRaw: params.budgetUsd,
      userId,
    },
    userId
  );

  return {
    id: localCart.id,
    supermarketId: params.supermarketId || localCart.supermarketId,
    userId: userId || '',
    isActive: true,
    budgetBs: params.budgetBs,
    budgetUsd: params.budgetUsd,
    totalEstimatedBs: null,
    totalEstimatedUsd: null,
    createdAt: now,
    updatedAt: now,
  };
}

export async function addCartProduct(
  params: AddCartProductParams,
  userId?: string
): Promise<CartProductResponse> {
  const localProduct = await cartProductRepository.upsert({
    cartId: params.cartId,
    name: params.name,
    priceBs: params.priceBs,
    priceUsd: params.priceUsd,
    quantity: params.quantity,
    isManualEntry: params.isManualEntry ?? true,
    imageUrl: params.imageUrl,
    supermarket: params.supermarketId,
  });

  await syncService.enqueueAndSync(
    'cart_products',
    'INSERT',
    localProduct.id,
    {
      id: localProduct.id,
      cartId: params.cartId,
      supermarketId: params.supermarketId,
      name: params.name,
      priceUsd: toCents(params.priceUsd),
      priceBs: toCents(params.priceBs),
      priceBcv: params.priceBcv !== undefined ? toCents(params.priceBcv) : 0,
      quantity: params.quantity,
      isManualEntry: params.isManualEntry ?? true,
      barcode: params.barcode || null,
      isWeightBased: params.isWeightBased,
      imageUrl: params.imageUrl || null,
      userId,
    },
    userId
  );

  const now = new Date().toISOString();
  return {
    id: localProduct.id,
    cartId: params.cartId,
    productId: localProduct.id,
    name: params.name,
    priceBs: params.priceBs,
    priceUsd: params.priceUsd,
    imageUrl: params.imageUrl || null,
    quantity: params.quantity,
    isManualEntry: params.isManualEntry ?? true,
    createdAt: now,
    updatedAt: now,
  };
}

export async function updateCartProduct(
  cartProductId: string,
  params: UpdateCartProductParams,
  userId?: string
): Promise<CartProductResponse> {
  await cartProductRepository.update(cartProductId, {
    name: params.name,
    priceBs: params.priceBs,
    priceUsd: params.priceUsd,
    quantity: params.quantity,
    imageUrl: params.imageUrl || null,
  });

  await syncService.enqueueAndSync(
    'cart_products',
    'UPDATE',
    cartProductId,
    {
      id: cartProductId,
      cartId: params.cartId,
      name: params.name,
      priceUsd: toCents(params.priceUsd),
      priceBs: toCents(params.priceBs),
      quantity: params.quantity,
      userId,
    },
    userId
  );

  const now = new Date().toISOString();
  return {
    id: cartProductId,
    cartId: params.cartId,
    productId: cartProductId,
    name: params.name,
    priceBs: params.priceBs,
    priceUsd: params.priceUsd,
    imageUrl: params.imageUrl || null,
    quantity: params.quantity,
    isManualEntry: false,
    createdAt: now,
    updatedAt: now,
  };
}

export async function updateCartProductQuantity(
  cartProductId: string,
  params: UpdateCartProductQuantityParams,
  userId?: string
): Promise<CartProductResponse> {
  await cartProductRepository.updateQuantity(cartProductId, params.quantity);

  await syncService.enqueueAndSync(
    'cart_products',
    'UPDATE',
    cartProductId,
    {
      id: cartProductId,
      cartId: params.cartId,
      quantity: params.quantity,
      userId,
    },
    userId
  );

  return {
    id: cartProductId,
    cartId: params.cartId,
    productId: cartProductId,
    name: '',
    priceBs: 0,
    priceUsd: 0,
    imageUrl: null,
    quantity: params.quantity,
    isManualEntry: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

function transformCartResponse(response: ApiCartResponse): ApiCartResponse {
  return {
    ...response,
    budgetBs: fromCents(response.budgetBs),
    budgetUsd: fromCents(response.budgetUsd),
    totalEstimatedBs:
      response.totalEstimatedBs !== null ? fromCents(response.totalEstimatedBs) : null,
    totalEstimatedUsd:
      response.totalEstimatedUsd !== null ? fromCents(response.totalEstimatedUsd) : null,
  };
}

export async function checkoutCart(cartId: string, userId?: string): Promise<ApiCartResponse> {
  try {
    const response = await apiPost<ApiResponse<ApiCartResponse>>(
      `/carts/${cartId}/checkout`,
      userId
    );
    if (response.success) {
      await cartRepository.update(cartId, { isActive: false });
    }
    return transformCartResponse(response.data);
  } catch {
    await cartRepository.update(cartId, { isActive: false });

    await syncService.enqueueAndSync(
      'carts',
      'UPDATE',
      cartId,
      { id: cartId, isActive: false, checkout: true, userId },
      userId
    );

    return {
      id: cartId,
      supermarketId: '',
      supermarketName: '',
      userId: userId || '',
      isActive: false,
      budgetBs: 0,
      budgetUsd: 0,
      totalEstimatedBs: null,
      totalEstimatedUsd: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }
}

export async function deleteCartProduct(cartProductId: string, userId?: string): Promise<void> {
  await cartProductRepository.delete(cartProductId);

  await syncService.enqueueAndSync(
    'cart_products',
    'DELETE',
    cartProductId,
    { id: cartProductId, userId },
    userId
  );
}
