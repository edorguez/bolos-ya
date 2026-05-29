import { createContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { authClient } from '../../lib/auth-client'

const API_URL = import.meta.env.VITE_GO_BACKEND_URL || 'http://localhost:8080/api/v1'

interface AuthState {
  isAuthenticated: boolean
  email: string | null
  role: string | null
  userId: string | null
  token: string | null
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
  userId: null,
  token: null,
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
    userId: null,
    token: null,
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
    const token = session?.session?.token || null

    if (user && allowedRoles.includes(role)) {
      fetch(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(r => r.json())
        .then(res => {
          setAuth({
            isAuthenticated: true,
            email: (user.email as string) || null,
            role,
            userId: res.data?.userId || null,
            token,
            loading: false,
          })
        })
        .catch(() => {
          setAuth({
            isAuthenticated: true,
            email: (user.email as string) || null,
            role,
            userId: (user.id as string) || null,
            token,
            loading: false,
          })
        })
    } else {
      setAuth({ isAuthenticated: false, email: null, role: null, userId: null, token: null, loading: false })
    }
  }, [session, isPending])

  const login = useCallback(async (email: string, password: string): Promise<LoginResult> => {
    const { data, error } = await authClient.signIn.email({ email, password })
    if (error) {
      return { success: false, error: error.message ?? 'Correo o contraseña incorrectos' }
    }

    const role = ((data?.user as Record<string, unknown>)?.role as string) || ''

    if (!role || !['admin', 'staff'].includes(role)) {
      await authClient.signOut()
      return { success: false, error: 'No tienes permisos para ingresar' }
    }

    setAuth({
      isAuthenticated: true,
      email: (data?.user?.email as string) || null,
      role,
      userId: (data?.user?.id as string) || null,
      token: data?.token || null,
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
