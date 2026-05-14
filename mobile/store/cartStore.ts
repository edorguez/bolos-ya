import { create } from 'zustand';

export interface CartProduct {
  id: string;
  productId: string;
  name: string;
  priceBs: number;
  priceUsd: number;
  quantity: number;
  supermarket: string;
  productImageUrl?: string;
}

export interface Cart {
  id: string;
  name: string;
  supermarket: string;
  supermarketId: string;
  products: CartProduct[];
  totalBs: number;
  totalUsd: number;
  budgetBs: number;
  budgetUsd: number;
  createdAt: Date;
  completed?: boolean;
  completedAt?: Date;
}

interface CartState {
  carts: Cart[];
  activeCartId: string | null;
  isLoading: boolean;
  addCart: (cart: Omit<Cart, 'createdAt'>) => void;
  updateCart: (id: string, updates: Partial<Cart>) => void;
  deleteCart: (id: string) => void;
  setActiveCart: (id: string | null) => void;
  addProductToCart: (cartId: string, product: CartProduct | Omit<CartProduct, 'id'>) => void;
  removeProductFromCart: (cartId: string, productId: string) => void;
  updateProductQuantity: (cartId: string, productId: string, newQuantity: number) => void;
  updateProduct: (cartId: string, productId: string, updates: Partial<CartProduct>) => void;
  completeCart: (id: string) => void;
}

export const useCartStore = create<CartState>(set => ({
  carts: [],
  activeCartId: null,
  isLoading: false,
  addCart: cart =>
    set(state => ({
      carts: [
        ...state.carts,
        {
          ...cart,
          createdAt: new Date(),
        },
      ],
    })),
  updateCart: (id, updates) =>
    set(state => ({
      carts: state.carts.map(cart => (cart.id === id ? { ...cart, ...updates } : cart)),
    })),
  deleteCart: id =>
    set(state => ({
      carts: state.carts.filter(cart => cart.id !== id),
      activeCartId: state.activeCartId === id ? null : state.activeCartId,
    })),
  setActiveCart: id => set({ activeCartId: id }),
  addProductToCart: (cartId, product) =>
    set(state => ({
      carts: state.carts.map(cart =>
        cart.id === cartId
          ? {
              ...cart,
              products: [
                ...cart.products,
                { ...product, id: (product as CartProduct).id || Date.now().toString() },
              ],
              totalBs: cart.totalBs + product.priceBs * product.quantity,
              totalUsd: cart.totalUsd + product.priceUsd * product.quantity,
            }
          : cart
      ),
    })),
  removeProductFromCart: (cartId, productId) =>
    set(state => ({
      carts: state.carts.map(cart => {
        if (cart.id !== cartId) return cart;

        const productToRemove = cart.products.find(p => p.id === productId);
        if (!productToRemove) return cart;

        return {
          ...cart,
          products: cart.products.filter(p => p.id !== productId),
          totalBs: cart.totalBs - productToRemove.priceBs * productToRemove.quantity,
          totalUsd: cart.totalUsd - productToRemove.priceUsd * productToRemove.quantity,
        };
      }),
    })),
  updateProductQuantity: (cartId, productId, newQuantity) =>
    set(state => ({
      carts: state.carts.map(cart => {
        if (cart.id !== cartId) return cart;

        const idx = cart.products.findIndex(p => p.id === productId);
        if (idx === -1) return cart;

        const oldProduct = cart.products[idx];
        const quantityDiff = newQuantity - oldProduct.quantity;
        const newTotalBs = cart.totalBs + oldProduct.priceBs * quantityDiff;
        const newTotalUsd = cart.totalUsd + oldProduct.priceUsd * quantityDiff;

        const updatedProducts = [...cart.products];
        updatedProducts[idx] = { ...oldProduct, quantity: newQuantity };

        return {
          ...cart,
          products: updatedProducts,
          totalBs: newTotalBs,
          totalUsd: newTotalUsd,
        };
      }),
    })),
  updateProduct: (cartId, productId, updates) =>
    set(state => ({
      carts: state.carts.map(cart => {
        if (cart.id !== cartId) return cart;

        const idx = cart.products.findIndex(p => p.id === productId);
        if (idx === -1) return cart;

        const oldProduct = cart.products[idx];
        const newProduct = { ...oldProduct, ...updates };

        const oldContributionBs = oldProduct.priceBs * oldProduct.quantity;
        const oldContributionUsd = oldProduct.priceUsd * oldProduct.quantity;
        const newContributionBs = newProduct.priceBs * newProduct.quantity;
        const newContributionUsd = newProduct.priceUsd * newProduct.quantity;

        const totalBsDiff = newContributionBs - oldContributionBs;
        const totalUsdDiff = newContributionUsd - oldContributionUsd;

        const updatedProducts = [...cart.products];
        updatedProducts[idx] = newProduct;

        return {
          ...cart,
          products: updatedProducts,
          totalBs: cart.totalBs + totalBsDiff,
          totalUsd: cart.totalUsd + totalUsdDiff,
        };
      }),
    })),
  completeCart: id =>
    set(state => ({
      carts: state.carts.map(cart =>
        cart.id === id ? { ...cart, completed: true, completedAt: new Date() } : cart
      ),
    })),
}));
