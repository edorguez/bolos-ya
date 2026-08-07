import { AppTheme } from './theme';

export function createCardStyles(theme: AppTheme) {
  return {
    base: {
      backgroundColor: theme.colors.surfaceContainerLowest,
      borderRadius: theme.borderRadius.md,
      borderCurve: 'continuous' as const,
      borderWidth: 1,
      borderColor: theme.colors.stoneSurface,
      boxShadow: theme.shadows.soft,
    },
  };
}
