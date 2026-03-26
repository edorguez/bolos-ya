import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { safeGetItem, safeSetItem, safeRemoveItem, initializeStorage } from '../utils/storage'

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

interface OnboardingState {
  hasCompletedOnboarding: boolean
  completeOnboarding: () => void
  resetOnboarding: () => void
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    set => ({
      hasCompletedOnboarding: false,
      completeOnboarding: () => set({ hasCompletedOnboarding: true }),
      resetOnboarding: () => set({ hasCompletedOnboarding: false }),
    }),
    {
      name: 'onboarding-storage',
      storage: createJSONStorage(() => safeStorage),
    }
  )
)
