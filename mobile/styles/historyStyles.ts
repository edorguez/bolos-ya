import { StyleSheet } from 'react-native';
import { AppTheme } from './theme';

export function createHistoryStyles(theme: AppTheme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scrollContent: {
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.lg,
      gap: theme.spacing.lg,
    },
    header: {
      backgroundColor: theme.colors.surfaceContainerLowest + 'cc',
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
    },
    headerLogo: {
      height: 24,
      aspectRatio: 1380 / 664,
    },
    historyList: {
      gap: theme.spacing.md,
    },
    emptyState: {
      paddingVertical: theme.spacing.xxl,
      alignItems: 'center',
      justifyContent: 'center',
      opacity: 0.4,
    },
    emptyStateText: {
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.medium,
      color: theme.colors.onSurface,
      marginTop: theme.spacing.md,
    },
  });
}
