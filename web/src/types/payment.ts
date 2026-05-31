export interface PaymentUser {
  id: string
  email: string
  authProvider: string
  isPremium: boolean
  isAnonymous: boolean
  premiumUntil?: string | null
}

export interface PaymentStatus {
  id: string
  name: string
  description: string
}

export interface RejectionReason {
  id: string
  reason: string
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
  statusId: string
  rejectionReasonId?: string | null
  rejectionMessage?: string | null
  approvedAt?: string | null
  rejectedAt?: string | null
  createdAt: string
  updatedAt: string
  deletedAt?: string | null
  user: PaymentUser
  paymentStatus: PaymentStatus
  rejectionReason?: RejectionReason | null
}

export interface ApiResponse<T> {
  success: boolean
  data: T
}

export interface PaginatedPayments {
  items: PaymentResponse[]
  total: number
  page: number
  pageSize: number
}
