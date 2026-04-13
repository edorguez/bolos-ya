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
      color: '#5918af',
      letterSpacing: -0.5,
    },
    section: {
      gap: theme.spacing.lg,
    },
    card: {
      backgroundColor: '#f8f1ff',
      borderRadius: theme.borderRadius.xl * 2,
      padding: theme.spacing.lg,
      gap: theme.spacing.lg,
      borderWidth: 1,
      borderColor: '#5918af0d',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    supermarketCarousel: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
      paddingBottom: theme.spacing.sm,
      marginHorizontal: -theme.spacing.xs,
      paddingHorizontal: theme.spacing.xs,
    },
    supermarketCarouselContent: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
    },
    supermarketLabel: {
      fontSize: theme.typography.fontSize.xs,
      fontWeight: theme.typography.fontWeight.bold,
      textTransform: 'uppercase',
      letterSpacing: 1,
      color: theme.colors.onSurfaceVariant,
      marginLeft: theme.spacing.xs,
      marginBottom: theme.spacing.sm
    },
    customMarketContainer: {
      marginTop: theme.spacing.sm,
    },
    customMarketInput: {
      backgroundColor: '#ffffff',
      borderRadius: theme.borderRadius.xl,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      fontSize: theme.typography.fontSize.md,
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.onSurface,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    budgetGrid: {
      flexDirection: 'row',
      gap: theme.spacing.md,
    },
    primaryButton: {
      backgroundColor: '#5918af',
      borderRadius: theme.borderRadius.full * 2,
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      gap: theme.spacing.md,
      shadowColor: '#5918af',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.3,
      shadowRadius: 20,
      elevation: 10,
      marginTop: theme.spacing.md,
    },
    primaryButtonText: {
      fontSize: theme.typography.fontSize.md,
      fontWeight: theme.typography.fontWeight.bold,
      color: '#FFFFFF',
    },
    primaryButtonOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: '#ffffff',
      opacity: 0,
    },
    cartCardsContainer: {
      flexDirection: 'row',
      gap: theme.spacing.md,
    }
  })
}
