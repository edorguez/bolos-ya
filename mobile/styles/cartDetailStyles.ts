import { StyleSheet } from 'react-native';
import { AppTheme } from './theme';

export function createCartDetailStyles(theme: AppTheme) {
  const buttonBarHeight = 56 + theme.spacing.lg * 2;
  const scrollContentPaddingBottom = buttonBarHeight + theme.spacing.md;

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    headerContainer: {
      backgroundColor: theme.colors.surfaceContainerLowest,
      paddingHorizontal: theme.spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.stoneSurface,
    },
    supermarketHeaderContainer: {
      paddingTop: theme.spacing.md,
    },
    scrollView: {
      flex: 1,
      paddingTop: theme.spacing.sm,
    },
    scrollContent: {
      paddingHorizontal: 24,
      paddingBottom: scrollContentPaddingBottom,
    },
    productList: {
      gap: 16,
    },
    sectionHeader: {
      fontSize: theme.typography.fontSize.sm,
      fontWeight: '600',
      color: theme.colors.onSurface,
      marginBottom: 16,
      marginTop: 8,
      letterSpacing: theme.typography.letterSpacing.lg,
    },
    emptyState: {
      paddingVertical: theme.spacing.lg,
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
    buttonBarContainer: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: theme.colors.surfaceContainerLowest,
      paddingTop: theme.spacing.md,
      paddingBottom: theme.spacing.md,
      paddingHorizontal: theme.spacing.md,
      alignItems: 'center',
    },
    buttonBar: {
      flexDirection: 'row',
      gap: theme.spacing.md,
      width: '100%',
      maxWidth: 400,
      alignSelf: 'center',
      position: 'relative',
    },
    button: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: theme.spacing.xs,
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      backgroundColor: theme.colors.midnight,
      borderRadius: theme.borderRadius.button,
    },
    buttonText: {
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.white,
      flexShrink: 1,
    },
    buttonCircle: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      padding: theme.spacing.sm,
      backgroundColor: theme.colors.secondaryContainer,
      borderRadius: theme.borderRadius.full,
    },
    buttonCircleComplete: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      width: 56,
      height: 56,
      backgroundColor: theme.colors.meadowGreen,
      borderRadius: theme.borderRadius.full,
      borderWidth: 2,
      borderColor: theme.colors.white,
      position: 'absolute',
      top: -8,
      left: '50%',
      marginLeft: -28,
      zIndex: 10,
    },
  });
}
