export interface PaymentUser {
  id: string
  email: string
  authProvider: string
  isPremium: boolean
  isAnonymous: boolean
  premiumUntil?: string | null
}

export interface PaymentResponse {
  id: string
  userId: string
  numberOfMonths: number
  referenceNumber: string
  bankName: string
  amountBs: number
  amountUsd: number
  priceBcv: number
  identification: string
  isDiscount: boolean
  paidAt: string
  isConfirmed: boolean
  createdAt: string
  updatedAt: string
  deletedAt?: string | null
  user: PaymentUser
}

export interface ApiResponse<T> {
  success: boolean
  data: T
}
