import { StyleSheet } from 'react-native'
import { AppTheme } from './theme'

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
      backgroundColor: '#ffffffcc',
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      alignItems: 'center',
      justifyContent: 'center',
      backdropFilter: 'blur(10px)',
      width: '100%',
    },
    headerTitle: {
      fontSize: theme.typography.fontSize.xl,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.primary,
      letterSpacing: -0.5,
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.md,
    },
    searchInput: {
      flex: 1,
      backgroundColor: theme.colors.surfaceContainerLow,
      borderRadius: theme.borderRadius.full,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.onSurface,
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    searchPlaceholder: {
      color: theme.colors.outline,
      fontSize: theme.typography.fontSize.sm,
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
  })
}
