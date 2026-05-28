import { useState, useEffect, useCallback } from 'react'
import { getAllPayments } from '../services/paymentService'
import type { PaymentResponse } from '../types/payment'

interface UsePaymentsResult {
  payments: PaymentResponse[]
  loading: boolean
  error: string | null
  refetch: () => void
}

export function usePayments(token?: string, userId?: string): UsePaymentsResult {
  const [payments, setPayments] = useState<PaymentResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!token || !userId) return

    let cancelled = false

    getAllPayments(token, userId)
      .then((result) => {
        if (cancelled) return
        setPayments(result)
        setLoading(false)
      })
      .catch((err) => {
        if (cancelled) return
        setError(err instanceof Error ? err.message : 'Error al cargar pagos')
        setLoading(false)
      })

    return () => { cancelled = true }
  }, [token, userId])

  const refetch = useCallback(async () => {
    if (!token || !userId) return

    setError(null)
    setPayments([])
    setLoading(true)

    try {
      const result = await getAllPayments(token, userId)
      setPayments(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar pagos')
    } finally {
      setLoading(false)
    }
  }, [token, userId])

  return { payments, loading, error, refetch }
}
