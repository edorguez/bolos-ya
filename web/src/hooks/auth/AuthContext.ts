import { createContext } from 'react'

export interface AuthState {
  isAuthenticated: boolean
  email: string | null
  role: string | null
  userId: string | null
  token: string | null
  loading: boolean
}

export interface LoginResult {
  success: boolean
  error?: string
}

export interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<LoginResult>
  logout: () => void
}

export const UNAUTHENTICATED_STATE: AuthState = {
  isAuthenticated: false,
  email: null,
  role: null,
  userId: null,
  token: null,
  loading: false,
}

export const AuthContext = createContext<AuthContextValue>({
  ...UNAUTHENTICATED_STATE,
  loading: true,
  login: async () => ({ success: false, error: 'Auth not initialized' }),
  logout: () => {},
})
