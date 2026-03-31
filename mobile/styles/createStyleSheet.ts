import { StyleSheet as RNStyleSheet } from 'react-native'
import { AppTheme } from './theme'

type StyleFunction<T> = (theme: AppTheme) => T
type StyleObject = Record<string, any>

export function createStyleSheet<T extends StyleObject>(styleFunction: StyleFunction<T>) {
  // Return a function that when called with theme returns computed styles
  return (theme: AppTheme): T => {
    const styles = styleFunction(theme)
    return RNStyleSheet.create(styles) as T
  }
}

// For compatibility with existing code expecting StyleSheet.create pattern
export const StyleSheet = {
  create: createStyleSheet,
}
