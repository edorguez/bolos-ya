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
  white: '#ffffff',
  black: '#000000',

  background: '#fbfaf9',
  surfaceContainerLowest: '#ffffff',
  surfaceContainerLow: '#f8f7f4',
  surfaceContainer: '#f2f0ed',
  surfaceContainerHigh: '#e8e6e3',
  surfaceContainerHighest: '#d4d2cf',
  primary: '#339933',
  onPrimary: '#ffffff',
  primaryPressed: '#287a28',
  primaryContainer: '#e5f2e5',
  onPrimaryContainer: '#1d5c1d',
  primaryText: '#287a28',
  focus: '#339933',
  secondary: '#ff3e00',
  secondaryContainer: '#f2f0ed',
  text: '#474645',
  textSecondary: '#848281',
  onSurface: '#474645',
  onSurfaceVariant: '#848281',
  outline: '#c6c6c6',
  outlineVariant: '#f2f0ed',
  error: '#ff2b3a',
  errorContainer: '#fee2e2',
  warning: '#ffbb26',
  success: '#00ca48',
  successPressed: '#00a83d',
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
    xxxxs: 8,
    xxxs: 10,
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
    bold: '700' as const,
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

const sharedIconSize = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 28,
  xxl: 36,
  xxxl: 48,
} as const;

const sharedSizes = {
  logo: 20,
  quantityButton: 24,
  optionIconWidth: 24,
  iconButton: 40,
  handleWidth: 48,
  handleHeight: 4,
  circleButton: 50,
  productIcon: 60,
  appBar: 64,
  formIcon: 64,
} as const;

const sharedShadows = {
  soft: '0 0 10px rgba(0, 0, 0, 0.08)',
  medium: '0 0 10px rgba(0, 0, 0, 0.4)',
  strong: '0 0 10px black',
} as const;

export const theme = {
  colors: lightColors,
  spacing: sharedSpacing,
  typography: sharedTypography,
  borderRadius: sharedBorderRadius,
  iconSize: sharedIconSize,
  sizes: sharedSizes,
  shadows: sharedShadows,
} as const;

export type AppTheme = typeof theme;

export function useAppTheme(): AppTheme {
  return theme;
}
