import { useColorScheme } from 'react-native'

export const lightTheme = {
  colors: {
    background: '#f6f6f6',
    surface: '#f6f6f6',
    surfaceContainerLowest: '#ffffff',
    surfaceContainerLow: '#f0f1f1',
    surfaceContainer: '#e7e8e8',
    surfaceContainerHigh: '#e1e3e3',
    surfaceContainerHighest: '#dbdddd',
    primary: '#5918af',
    primaryContainer: '#b58aff',
    primaryLight: '#818CF8',
    secondary: '#1222ff',
    secondaryContainer: '#cbceff',
    tertiary: '#795500',
    tertiaryContainer: '#fac052',
    text: '#2d2f2f',
    textSecondary: '#5a5c5c',
    onSurface: '#2d2f2f',
    onSurfaceVariant: '#5a5c5c',
    outline: '#757777',
    outlineVariant: '#acadad',
    border: '#E5E7EB',
    error: '#b41340',
    errorContainer: '#f74b6d',
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
      xxs: 10,
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
    surfaceContainerLowest: '#000000',
    surfaceContainerLow: '#1a1d1e',
    surfaceContainer: '#222526',
    surfaceContainerHigh: '#2c2f30',
    surfaceContainerHighest: '#373a3b',
    primary: '#a874ff',
    primaryContainer: '#3c0080',
    primaryLight: '#818CF8',
    secondary: '#babfff',
    secondaryContainer: '#000bb2',
    tertiary: '#ebb246',
    tertiaryContainer: '#583d00',
    text: '#e1e3e3',
    textSecondary: '#9ca3af',
    onSurface: '#e1e3e3',
    onSurfaceVariant: '#9ca3af',
    outline: '#757777',
    outlineVariant: '#3c3d3d',
    border: '#374151',
    error: '#f74b6d',
    errorContainer: '#a70138',
    warning: '#FBBF24',
    success: '#34D399',
  },
  spacing: lightTheme.spacing,
  typography: lightTheme.typography,
  borderRadius: lightTheme.borderRadius,
} as const

export type AppTheme = typeof lightTheme | typeof darkTheme

export function useAppTheme() {
  const colorScheme = useColorScheme()
  return colorScheme === 'dark' ? darkTheme : lightTheme
}
