import { StyleSheet } from 'react-native';
import { AppTheme } from './theme';

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
      backgroundColor: theme.colors.surfaceContainerLowest + 'cc',
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
    },
    headerTitle: {
      fontSize: theme.typography.fontSize.xl,
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.charcoalPrimary,
      letterSpacing: theme.typography.letterSpacing.xl,
    },
    section: {
      gap: theme.spacing.lg,
    },
    card: {
      backgroundColor: theme.colors.surfaceContainerLowest,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.lg,
      gap: theme.spacing.lg,
      borderWidth: 1,
      borderColor: theme.colors.stoneSurface,
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
      fontWeight: theme.typography.fontWeight.semibold,
      textTransform: 'uppercase',
      letterSpacing: 1,
      color: theme.colors.textSecondary,
      marginLeft: theme.spacing.xs,
      marginBottom: theme.spacing.sm,
    },
    customMarketContainer: {
      marginTop: theme.spacing.sm,
    },
    customMarketInput: {
      backgroundColor: theme.colors.surfaceContainerLow,
      borderRadius: theme.borderRadius.md,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.md,
      fontSize: theme.typography.fontSize.md,
      color: theme.colors.text,
      borderWidth: 1,
      borderColor: theme.colors.stoneSurface,
    },
    budgetGrid: {
      flexDirection: 'row',
      gap: theme.spacing.md,
    },
    primaryButton: {
      backgroundColor: theme.colors.midnight,
      borderRadius: theme.borderRadius.button,
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      gap: theme.spacing.md,
      marginTop: theme.spacing.md,
    },
    primaryButtonText: {
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.medium,
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
    },
  });
}
