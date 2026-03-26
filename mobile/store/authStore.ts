import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { safeGetItem, safeSetItem, safeRemoveItem } from '../utils/storage'

const safeStorage = {
  getItem: (key: string): Promise<string | null> => {
    return safeGetItem(key)
  },
  setItem: (key: string, value: string): Promise<void> => {
    return safeSetItem(key, value)
  },
  removeItem: (key: string): Promise<void> => {
    return safeRemoveItem(key)
  },
}

interface AuthState {
  token: string | null
  user: {
    id: string
    email: string
    isPremium: boolean
  } | null
  isLoading: boolean
  setToken: (token: string | null) => void
  setUser: (user: AuthState['user']) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    set => ({
      token: null,
      user: null,
      isLoading: false,
      setToken: token => set({ token }),
      setUser: user => set({ user }),
      logout: () => set({ token: null, user: null }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => safeStorage),
    }
  )
)
