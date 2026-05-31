import { useReducer, useCallback, useEffect } from 'react'
import { getAllPayments } from '../services/paymentService'
import type { PaymentResponse } from '../types/payment'

interface State {
  payments: PaymentResponse[]
  loading: boolean
  error: string | null
  total: number
  page: number
  pageSize: number
  sortBy: string
  sortDir: 'asc' | 'desc'
}

type Action =
  | { type: 'FETCH_START' }
  | { type: 'FETCH_SUCCESS'; payments: PaymentResponse[]; total: number }
  | { type: 'FETCH_ERROR'; error: string }
  | { type: 'SET_PAGE'; page: number }
  | { type: 'SET_PAGE_SIZE'; pageSize: number }
  | { type: 'SET_SORT'; sortBy: string; sortDir: 'asc' | 'desc' }

const initialState: State = {
  payments: [],
  loading: true,
  error: null,
  total: 0,
  page: 0,
  pageSize: 10,
  sortBy: '',
  sortDir: 'desc',
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, loading: true, error: null }
    case 'FETCH_SUCCESS':
      return { ...state, loading: false, payments: action.payments, total: action.total }
    case 'FETCH_ERROR':
      return { ...state, loading: false, error: action.error, payments: [], total: 0 }
    case 'SET_PAGE':
      return { ...state, page: action.page }
    case 'SET_PAGE_SIZE':
      return { ...state, pageSize: action.pageSize, page: 0 }
    case 'SET_SORT':
      return { ...state, sortBy: action.sortBy, sortDir: action.sortDir, page: 0 }
  }
}

interface UsePaymentsResult {
  payments: PaymentResponse[]
  loading: boolean
  error: string | null
  total: number
  page: number
  pageSize: number
  sortBy: string
  sortDir: 'asc' | 'desc'
  setPage: (page: number) => void
  setPageSize: (size: number) => void
  setSort: (sortBy: string, sortDir: 'asc' | 'desc') => void
  refetch: () => void
}

export function usePayments(token?: string, userId?: string): UsePaymentsResult {
  const [state, dispatch] = useReducer(reducer, initialState)

  const fetch = useCallback(async (p: number, ps: number, sb: string, sd: 'asc' | 'desc') => {
    if (!token || !userId) return

    dispatch({ type: 'FETCH_START' })

    try {
      const result = await getAllPayments(token, userId, { page: p + 1, pageSize: ps, sortBy: sb, sortDir: sd })
      dispatch({ type: 'FETCH_SUCCESS', payments: result.items, total: result.total })
    } catch (err) {
      dispatch({ type: 'FETCH_ERROR', error: err instanceof Error ? err.message : 'Error al cargar pagos' })
    }
  }, [token, userId])

  useEffect(() => {
    fetch(state.page, state.pageSize, state.sortBy, state.sortDir)
  }, [state.page, state.pageSize, state.sortBy, state.sortDir, fetch])

  const setPage = useCallback((page: number) => {
    dispatch({ type: 'SET_PAGE', page })
  }, [])

  const setPageSize = useCallback((pageSize: number) => {
    dispatch({ type: 'SET_PAGE_SIZE', pageSize })
  }, [])

  const setSort = useCallback((sortBy: string, sortDir: 'asc' | 'desc') => {
    dispatch({ type: 'SET_SORT', sortBy, sortDir })
  }, [])

  const refetch = useCallback(() => {
    fetch(state.page, state.pageSize, state.sortBy, state.sortDir)
  }, [state.page, state.pageSize, state.sortBy, state.sortDir, fetch])

  return {
    payments: state.payments,
    loading: state.loading,
    error: state.error,
    total: state.total,
    page: state.page,
    pageSize: state.pageSize,
    sortBy: state.sortBy,
    sortDir: state.sortDir,
    setPage,
    setPageSize,
    setSort,
    refetch,
  }
}
