import { useColorScheme } from 'react-native';

const lightColors = {
  warmCanvas: '#fbfaf9',
  stoneSurface: '#f2f0ed',
  parchmentCard: '#f8f7f4',
  graphite: '#474645',
  charcoalPrimary: '#343433',
  midnight: '#121212',
  obsidian: '#000000',
  ash: '#848281',
  fog: '#c6c6c6',
  smoke: '#a7a7a7',
  pepper: '#282624',
  emberOrange: '#ff3e00',
  meadowGreen: '#00ca48',
  skyBlue: '#0090ff',
  sunburstYellow: '#ffbb26',
  deepAmber: '#d48f00',
  oceanBlue: '#0086fc',
  iceBlue: '#64c6ff',
  spearmint: '#00c978',
  flamingo: '#ff58ae',
  violetPop: '#9f4fff',
  coralRed: '#ff2b3a',
  validGreen: '#00c454',

  background: '#fbfaf9',
  surface: '#fbfaf9',
  surfaceContainerLowest: '#ffffff',
  surfaceContainerLow: '#f8f7f4',
  surfaceContainer: '#f2f0ed',
  surfaceContainerHigh: '#e8e5e0',
  surfaceContainerHighest: '#c6c6c6',
  primary: '#121212',
  primaryContainer: '#f6f4ef',
  primaryLight: '#ff3e00',
  secondary: '#ff3e00',
  secondaryContainer: '#f6f4ef',
  tertiary: '#00ca48',
  tertiaryContainer: '#ffbb26',
  text: '#474645',
  textSecondary: '#848281',
  onSurface: '#474645',
  onSurfaceVariant: '#848281',
  outline: '#c6c6c6',
  outlineVariant: '#f2f0ed',
  border: '#f2f0ed',
  error: '#ff2b3a',
  errorContainer: '#ff2b3a',
  warning: '#ffbb26',
  success: '#00c454',
};

const darkColors = {
  warmCanvas: '#1a1817',
  stoneSurface: '#373533',
  parchmentCard: '#2e2c2a',
  graphite: '#c8c6c3',
  charcoalPrimary: '#d4d2cf',
  midnight: '#e8e6e3',
  obsidian: '#f0eeeb',
  ash: '#a09e9b',
  fog: '#555351',
  smoke: '#777573',
  pepper: '#d8d6d3',
  emberOrange: '#ff5722',
  meadowGreen: '#00d960',
  skyBlue: '#4da6ff',
  sunburstYellow: '#ffcc44',
  deepAmber: '#e8a300',
  oceanBlue: '#4da6ff',
  iceBlue: '#8dd4ff',
  spearmint: '#00d960',
  flamingo: '#ff70c0',
  violetPop: '#b87aff',
  coralRed: '#ff4757',
  validGreen: '#00d960',

  background: '#1a1817',
  surface: '#1a1817',
  surfaceContainerLowest: '#252322',
  surfaceContainerLow: '#2e2c2a',
  surfaceContainer: '#373533',
  surfaceContainerHigh: '#403d3b',
  surfaceContainerHighest: '#555351',
  primary: '#e8e6e3',
  primaryContainer: '#343231',
  primaryLight: '#ff5722',
  secondary: '#ff5722',
  secondaryContainer: '#343231',
  tertiary: '#00d960',
  tertiaryContainer: '#ffcc44',
  text: '#c8c6c3',
  textSecondary: '#a09e9b',
  onSurface: '#c8c6c3',
  onSurfaceVariant: '#a09e9b',
  outline: '#555351',
  outlineVariant: '#373533',
  border: '#373533',
  error: '#ff4757',
  errorContainer: '#ff4757',
  warning: '#ffcc44',
  success: '#00d960',
};

const sharedSpacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

const sharedTypography = {
  fontSize: {
    xxs: 12,
    xs: 13,
    sm: 14,
    md: 15,
    lg: 19,
    xl: 23,
    xxl: 44,
  },
  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '600' as const,
  },
  fontFamily: {
    inter: 'Inter',
    system: undefined as string | undefined,
  },
  letterSpacing: {
    xxs: -0.14,
    xs: -0.17,
    sm: -0.18,
    md: -0.2,
    lg: -0.25,
    xl: -0.44,
    xxl: -1.14,
  },
} as const;

const sharedBorderRadius = {
  sm: 6,
  md: 10,
  lg: 12,
  xl: 16,
  full: 9999,
  button: 32,
} as const;

export const lightTheme = {
  colors: lightColors,
  spacing: sharedSpacing,
  typography: sharedTypography,
  borderRadius: sharedBorderRadius,
} as const;

export const darkTheme = {
  colors: darkColors,
  spacing: sharedSpacing,
  typography: sharedTypography,
  borderRadius: sharedBorderRadius,
} as const;

export type AppTheme = typeof lightTheme | typeof darkTheme;

export function useAppTheme() {
  const colorScheme = useColorScheme();
  return colorScheme === 'dark' ? darkTheme : lightTheme;
}
