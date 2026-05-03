import { createContext, useState, useCallback, type ReactNode } from 'react'

interface AuthState {
  isAuthenticated: boolean
  email: string | null
}

interface LoginResult {
  success: boolean
  error?: string
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<LoginResult>
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue>({
  isAuthenticated: false,
  email: null,
  login: async () => ({ success: false, error: 'Auth not initialized' }),
  logout: () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<AuthState>({ isAuthenticated: false, email: null })

  const login = useCallback(async (email: string, password: string): Promise<LoginResult> => {
    await new Promise((r) => setTimeout(r, 800))

    if (!email.includes('@')) {
      return { success: false, error: 'Invalid email format' }
    }
    if (password.length < 4) {
      return { success: false, error: 'Password must be at least 4 characters' }
    }

    setAuth({ isAuthenticated: true, email })
    return { success: true }
  }, [])

  const logout = useCallback(() => {
    setAuth({ isAuthenticated: false, email: null })
  }, [])

  return (
    <AuthContext.Provider value={{ isAuthenticated: auth.isAuthenticated, email: auth.email, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
