import { createContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { authClient } from '../../lib/auth-client'

interface AuthState {
  isAuthenticated: boolean
  email: string | null
  role: string | null
  loading: boolean
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
  role: null,
  loading: true,
  login: async () => ({ success: false, error: 'Auth not initialized' }),
  logout: () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, isPending } = authClient.useSession()
  const [auth, setAuth] = useState<AuthState>({
    isAuthenticated: false,
    email: null,
    role: null,
    loading: true,
  })

  useEffect(() => {
    if (isPending) {
      setAuth((prev) => ({ ...prev, loading: true }))
      return
    }

    const user = session?.user as Record<string, unknown> | undefined
    const role = (user?.role as string) || ''
    const allowedRoles = ['admin', 'staff']

    if (user && allowedRoles.includes(role)) {
      setAuth({
        isAuthenticated: true,
        email: (user.email as string) || null,
        role,
        loading: false,
      })
    } else {
      setAuth({ isAuthenticated: false, email: null, role: null, loading: false })
    }
  }, [session, isPending])

  const login = useCallback(async (email: string, password: string): Promise<LoginResult> => {
    const { data, error } = await authClient.signIn.email({ email, password })
    if (error) {
      return { success: false, error: error.message ?? 'Invalid credentials' }
    }

    const role = ((data?.user as Record<string, unknown>)?.role as string) || ''

    if (!role || !['admin', 'staff'].includes(role)) {
      await authClient.signOut()
      return { success: false, error: 'Unauthorized: Staff access only' }
    }

    setAuth({
      isAuthenticated: true,
      email: (data?.user?.email as string) || null,
      role,
      loading: false,
    })

    return { success: true }
  }, [])

  const logout = useCallback(async () => {
    await authClient.signOut()
  }, [])

  return (
    <AuthContext.Provider value={{ ...auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
