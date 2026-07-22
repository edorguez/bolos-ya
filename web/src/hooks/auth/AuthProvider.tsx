import { useState, useEffect, useCallback, type ReactNode } from 'react'
import { authClient } from '../../lib/auth-client'
import { AuthContext, UNAUTHENTICATED_STATE } from './AuthContext'
import type { AuthState, LoginResult } from './AuthContext'

const API_URL = import.meta.env.VITE_GO_BACKEND_URL || 'http://localhost:8080/api/v1'

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, isPending } = authClient.useSession()
  const [auth, setAuth] = useState<AuthState>({
    ...UNAUTHENTICATED_STATE,
    loading: true,
  })

  useEffect(() => {
    if (isPending) return

    const user = session?.user as Record<string, unknown> | undefined
    const role = (user?.role as string) || ''
    const allowedRoles = ['admin', 'staff']
    const token = session?.session?.token || null

    if (user && allowedRoles.includes(role)) {
      const validateWithBackend = async () => {
        try {
          const res = await fetch(`${API_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          if (!res.ok) {
            setAuth(UNAUTHENTICATED_STATE)
            return
          }
          const body = await res.json()
          setAuth({
            isAuthenticated: true,
            email: (user.email as string) || null,
            role,
            userId: body?.userId ?? body?.data?.userId ?? null,
            token,
            loading: false,
          })
        } catch {
          setAuth(UNAUTHENTICATED_STATE)
        }
      }
      validateWithBackend()
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAuth({ ...UNAUTHENTICATED_STATE, loading: false })
    }
  }, [session, isPending])

  const loading = isPending || auth.loading

  const login = useCallback(async (email: string, password: string): Promise<LoginResult> => {
    const { data, error } = await authClient.signIn.email({ email, password })
    if (error) {
      return { success: false, error: error.message ?? 'Correo o contraseña incorrectos' }
    }

    const role = ((data?.user as Record<string, unknown>)?.role as string) || ''

    if (!role || !['admin', 'staff'].includes(role)) {
      await authClient.signOut()
      setAuth(UNAUTHENTICATED_STATE)
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
    setAuth(UNAUTHENTICATED_STATE)
  }, [])

  return (
    <AuthContext.Provider value={{ ...auth, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
