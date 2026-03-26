import AsyncStorage from '@react-native-async-storage/async-storage'
import { Platform } from 'react-native'

let storageReady = false
let memoryStorage = new Map<string, string>()
let asyncStorageAvailable = false

try {
  asyncStorageAvailable = !!AsyncStorage && typeof AsyncStorage.getItem === 'function'
} catch {
  asyncStorageAvailable = false
}

export const initializeStorage = async (): Promise<boolean> => {
  try {
    if (Platform.OS === 'web') {
      storageReady = true
      return true
    }

    if (!asyncStorageAvailable) {
      storageReady = false
      return false
    }

    await AsyncStorage.getItem('@storage_test')
    storageReady = true
    return true
  } catch (error) {
    console.warn('AsyncStorage not available, using memory storage:', error)
    storageReady = false
    return false
  }
}

export const safeGetItem = async (key: string): Promise<string | null> => {
  try {
    if (!storageReady) {
      const success = await initializeStorage()
      if (!success) {
        return memoryStorage.get(key) || null
      }
    }

    if (!asyncStorageAvailable) {
      return memoryStorage.get(key) || null
    }

    return await AsyncStorage.getItem(key)
  } catch (error) {
    console.warn(`Failed to get item for key ${key}, using memory fallback:`, error)
    return memoryStorage.get(key) || null
  }
}

export const safeSetItem = async (key: string, value: string): Promise<void> => {
  try {
    if (!storageReady) {
      const success = await initializeStorage()
      if (!success) {
        memoryStorage.set(key, value)
        return
      }
    }

    if (!asyncStorageAvailable) {
      memoryStorage.set(key, value)
      return
    }

    await AsyncStorage.setItem(key, value)
  } catch (error) {
    console.warn(`Failed to set item for key ${key}, using memory fallback:`, error)
    memoryStorage.set(key, value)
  }
}

export const safeRemoveItem = async (key: string): Promise<void> => {
  try {
    if (!storageReady) {
      const success = await initializeStorage()
      if (!success) {
        memoryStorage.delete(key)
        return
      }
    }

    if (!asyncStorageAvailable) {
      memoryStorage.delete(key)
      return
    }

    await AsyncStorage.removeItem(key)
  } catch (error) {
    console.warn(`Failed to remove item for key ${key}, using memory fallback:`, error)
    memoryStorage.delete(key)
  }
}

export const safeClear = async (): Promise<void> => {
  try {
    if (!storageReady) {
      const success = await initializeStorage()
      if (!success) {
        memoryStorage.clear()
        return
      }
    }

    if (!asyncStorageAvailable) {
      memoryStorage.clear()
      return
    }

    await AsyncStorage.clear()
  } catch (error) {
    console.warn('Failed to clear storage, using memory fallback:', error)
    memoryStorage.clear()
  }
}
