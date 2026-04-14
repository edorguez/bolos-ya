import { create } from 'zustand'
import { calculateTotal } from '../utils/formatters'

export interface CartItem {
  id: string
  productId: string
  name: string
  priceBs: number
  priceUsd: number
  quantity: number
  supermarket: string
  productImageUrl?: string
}

export interface Cart {
  id: string
  name: string
  supermarket: string
  items: CartItem[]
  totalBs: number
  totalUsd: number
  budgetBs: number
  budgetUsd: number
  createdAt: Date
}

interface CartState {
  carts: Cart[]
  activeCartId: string | null
  isLoading: boolean
  addCart: (cart: Omit<Cart, 'id' | 'createdAt'>) => void
  updateCart: (id: string, updates: Partial<Cart>) => void
  deleteCart: (id: string) => void
  setActiveCart: (id: string | null) => void
  addItemToCart: (cartId: string, item: Omit<CartItem, 'id'>) => void
  removeItemFromCart: (cartId: string, itemId: string) => void
  updateItemQuantity: (cartId: string, itemId: string, newQuantity: number) => void
  updateItem: (cartId: string, itemId: string, updates: Partial<CartItem>) => void
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
          id: Date.now().toString(),
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
  addItemToCart: (cartId, item) =>
    set(state => ({
      carts: state.carts.map(cart =>
        cart.id === cartId
          ? {
              ...cart,
              items: [...cart.items, { ...item, id: Date.now().toString() }],
              totalBs: cart.totalBs + item.priceBs * item.quantity,
              totalUsd: cart.totalUsd + item.priceUsd * item.quantity,
            }
          : cart
      ),
    })),
  removeItemFromCart: (cartId, itemId) =>
    set(state => ({
      carts: state.carts.map(cart => {
        if (cart.id !== cartId) return cart

        const itemToRemove = cart.items.find(item => item.id === itemId)
        if (!itemToRemove) return cart

        return {
          ...cart,
          items: cart.items.filter(item => item.id !== itemId),
          totalBs: cart.totalBs - itemToRemove.priceBs * itemToRemove.quantity,
          totalUsd: cart.totalUsd - itemToRemove.priceUsd * itemToRemove.quantity,
        }
      }),
    })),
  updateItemQuantity: (cartId, itemId, newQuantity) =>
    set(state => ({
      carts: state.carts.map(cart => {
        if (cart.id !== cartId) return cart

        const itemIndex = cart.items.findIndex(item => item.id === itemId)
        if (itemIndex === -1) return cart

        const oldItem = cart.items[itemIndex]
        const quantityDiff = newQuantity - oldItem.quantity
        const newTotalBs = cart.totalBs + oldItem.priceBs * quantityDiff
        const newTotalUsd = cart.totalUsd + oldItem.priceUsd * quantityDiff

        const updatedItems = [...cart.items]
        updatedItems[itemIndex] = { ...oldItem, quantity: newQuantity }

        return {
          ...cart,
          items: updatedItems,
          totalBs: newTotalBs,
          totalUsd: newTotalUsd,
        }
      }),
    })),
  updateItem: (cartId, itemId, updates) =>
    set(state => ({
      carts: state.carts.map(cart => {
        if (cart.id !== cartId) return cart

        const itemIndex = cart.items.findIndex(item => item.id === itemId)
        if (itemIndex === -1) return cart

        const oldItem = cart.items[itemIndex]
        const newItem = { ...oldItem, ...updates }

        // Recalculate totals based on changes
        const oldContributionBs = oldItem.priceBs * oldItem.quantity
        const oldContributionUsd = oldItem.priceUsd * oldItem.quantity
        const newContributionBs = newItem.priceBs * newItem.quantity
        const newContributionUsd = newItem.priceUsd * newItem.quantity

        const totalBsDiff = newContributionBs - oldContributionBs
        const totalUsdDiff = newContributionUsd - oldContributionUsd

        const updatedItems = [...cart.items]
        updatedItems[itemIndex] = newItem

        return {
          ...cart,
          items: updatedItems,
          totalBs: cart.totalBs + totalBsDiff,
          totalUsd: cart.totalUsd + totalUsdDiff,
        }
      }),
    })),
}))
