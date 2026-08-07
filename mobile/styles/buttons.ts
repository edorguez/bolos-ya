import { AppTheme } from './theme';

export function createButtonStyles(theme: AppTheme) {
  return {
    base: {
      borderRadius: theme.borderRadius.button,
      borderCurve: 'continuous' as const,
      boxShadow: theme.shadows.medium,
    },
    pressed: {
      transform: [{ scale: 1.03 }],
      opacity: 0.9,
    },
  };
}
