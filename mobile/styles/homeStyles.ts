import { StyleSheet } from 'react-native'
import { AppTheme } from './theme'

export function createHomeStyles(theme: AppTheme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scrollContent: {
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.lg,
      gap: theme.spacing.xl,
    },
    header: {
      backgroundColor: theme.colors.surfaceContainerLowest,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      alignItems: 'center',
      justifyContent: 'center',
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outlineVariant,
    },
    headerTitle: {
      fontSize: theme.typography.fontSize.xl,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.primary,
    },
    section: {
      gap: theme.spacing.md,
    },
    card: {
      backgroundColor: '#f8eae8',
      borderRadius: theme.borderRadius.xl,
      padding: theme.spacing.lg,
      gap: theme.spacing.lg,
      borderWidth: 1,
      borderColor: theme.colors.primary + '10',
    },
    supermarketGrid: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
    },
    budgetGrid: {
      flexDirection: 'row',
      gap: theme.spacing.md,
    },
    primaryButton: {
      backgroundColor: theme.colors.primary,
      borderRadius: theme.borderRadius.full,
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      gap: theme.spacing.sm,
      shadowColor: theme.colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 4,
    },
    primaryButtonText: {
      fontSize: theme.typography.fontSize.lg,
      fontWeight: theme.typography.fontWeight.bold,
      color: '#FFFFFF',
    },
    cartCardsContainer: {
      flexDirection: 'row',
      gap: theme.spacing.md,
    },
  })
}
