import { Redirect, SplashScreen } from 'expo-router'
import { useOnboardingStore } from '../store/onboardingStore'
import { useEffect, useState } from 'react'
import { View } from 'react-native'
import { initializeStorage } from '../utils/storage'

SplashScreen.preventAutoHideAsync()

export default function Index() {
  const [isStorageReady, setIsStorageReady] = useState(false)
  const [storageFailed, setStorageFailed] = useState(false)
  const hasCompletedOnboarding = useOnboardingStore(state => state.hasCompletedOnboarding)

  useEffect(() => {
    const init = async () => {
      try {
        const success = await initializeStorage()
        if (!success) {
          setStorageFailed(true)
        }
        setIsStorageReady(true)
        SplashScreen.hideAsync()
      } catch (error) {
        console.warn('Storage initialization failed:', error)
        setStorageFailed(true)
        setIsStorageReady(true)
        SplashScreen.hideAsync()
      }
    }
    init()
  }, [])

  if (!isStorageReady) {
    return null
  }

  if (storageFailed) {
    return <Redirect href="/(tabs)" />
  }

  if (hasCompletedOnboarding) {
    return <Redirect href="/(tabs)" />
  }

  return <Redirect href="/(onboarding)/welcome" />
}
