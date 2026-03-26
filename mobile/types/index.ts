export interface User {
  id: string
  email: string
  authProvider: 'email' | 'google' | 'guest'
  isPremium: boolean
  premiumUntil?: Date
  lastSyncAt?: Date
}

export interface Supermarket {
  id: string
  name: string
  chain?: string
  isCustom: boolean
}

export interface Product {
  id: string
  name: string
  barcode?: string
  category?: string
  isWeightBased: boolean
}

export interface Price {
  id: string
  productId: string
  supermarketId: string
  priceBolivares: number
  priceUsd: number
  reportedBy: string
  confidenceScore: number
  reportsCount: number
  capturedAt: Date
}

export interface Cart {
  id: string
  userId: string
  supermarketId: string
  status: 'active' | 'completed' | 'archived'
  budgetBs: number
  budgetUsd: number
  totalEstimatedBs: number
  totalEstimatedUsd: number
  createdAt: Date
  updatedAt: Date
}

export interface CartItem {
  id: string
  cartId: string
  productId: string
  priceSnapshotBs: number
  priceSnapshotUsd: number
  quantity: number
  isManualEntry: boolean
  productImageUrl?: string
  addedAt: Date
  updatedAt: Date
}

export interface SyncOperation {
  table: string
  action: 'INSERT' | 'UPDATE' | 'DELETE'
  payload: Record<string, unknown>
  timestamp: number
}