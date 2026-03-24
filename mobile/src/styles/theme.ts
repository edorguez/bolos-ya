import { useColorScheme } from 'react-native'

export const lightTheme = {
  colors: {
    background: '#FFFFFF',
    surface: '#F5F5F5',
    primary: '#4F46E5',
    primaryLight: '#818CF8',
    secondary: '#10B981',
    text: '#1F2937',
    textSecondary: '#6B7280',
    border: '#E5E7EB',
    error: '#EF4444',
    warning: '#F59E0B',
    success: '#10B981',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  typography: {
    fontSize: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 20,
      xl: 24,
      xxl: 32,
    },
    fontWeight: {
      regular: '400' as const,
      medium: '500' as const,
      semibold: '600' as const,
      bold: '700' as const,
    },
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
  },
} as const

export const darkTheme = {
  colors: {
    background: '#111827',
    surface: '#1F2937',
    primary: '#6366F1',
    primaryLight: '#818CF8',
    secondary: '#10B981',
    text: '#F9FAFB',
    textSecondary: '#9CA3AF',
    border: '#374151',
    error: '#F87171',
    warning: '#FBBF24',
    success: '#34D399',
  },
  spacing: lightTheme.spacing,
  typography: lightTheme.typography,
  borderRadius: lightTheme.borderRadius,
} as const

export type AppTheme = typeof lightTheme

export function useAppTheme() {
  const colorScheme = useColorScheme()
  return colorScheme === 'dark' ? darkTheme : lightTheme
}