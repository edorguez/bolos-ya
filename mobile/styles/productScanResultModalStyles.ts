import { StyleSheet, Dimensions } from 'react-native';
import { AppTheme } from './theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const MODAL_WIDTH = Math.min(SCREEN_WIDTH * 0.9, 400);

export function createProductScanResultModalStyles(theme: AppTheme) {
  return StyleSheet.create({
    modalContainer: {
      flex: 1,
      justifyContent: 'flex-end',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.4)',
      marginBottom: theme.spacing.xxl,
    },
    modalContent: {
      width: MODAL_WIDTH,
      backgroundColor: theme.colors.surfaceContainerLowest,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.lg,
      marginBottom: theme.spacing.lg,
      borderWidth: 1,
      borderColor: theme.colors.stoneSurface,
    },
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: theme.spacing.md,
    },
    titleContainer: {
      flex: 1,
    },
    subtitle: {
      fontSize: theme.typography.fontSize.xxs,
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.emberOrange,
      textTransform: 'uppercase',
      letterSpacing: 1,
      marginBottom: theme.spacing.xs,
    },
    productName: {
      fontSize: theme.typography.fontSize.md,
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.onSurface,
      lineHeight: 24,
      letterSpacing: theme.typography.letterSpacing.lg,
    },
    verifiedBadge: {
      backgroundColor: theme.colors.meadowGreen + '20',
      padding: theme.spacing.sm,
      borderRadius: theme.borderRadius.md,
    },
    priceRow: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      gap: 16,
      marginTop: theme.spacing.sm,
      marginBottom: theme.spacing.lg,
    },
    priceColumn: {
      flex: 1,
    },
    priceLabel: {
      fontSize: theme.typography.fontSize.xxs,
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.outline,
      textTransform: 'uppercase',
      marginBottom: theme.spacing.xs,
      letterSpacing: 1,
    },
    priceBs: {
      fontSize: theme.typography.fontSize.lg,
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.onSurface,
      letterSpacing: theme.typography.letterSpacing.lg,
    },
    priceUsd: {
      fontSize: theme.typography.fontSize.lg,
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.emberOrange,
      letterSpacing: theme.typography.letterSpacing.lg,
    },
    divider: {
      width: 1,
      height: 40,
      backgroundColor: theme.colors.stoneSurface,
      marginBottom: theme.spacing.xs,
    },
    quantitySection: {
      backgroundColor: theme.colors.surfaceContainerLow,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.sm,
      marginBottom: theme.spacing.md,
    },
    quantityControls: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: theme.spacing.lg,
      backgroundColor: theme.colors.surfaceContainerLowest,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.xs,
    },
    quantityButton: {
      width: 30,
      height: 30,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
    },
    quantityNumber: {
      fontSize: theme.typography.fontSize.xs,
      fontWeight: theme.typography.fontWeight.semibold,
      minWidth: 32,
      textAlign: 'center',
      color: theme.colors.onSurface,
    },
    actionRow: {
      flexDirection: 'row',
      gap: theme.spacing.xxs,
      marginTop: theme.spacing.sm,
    },
    retryButton: {
      flex: 1,
      paddingVertical: theme.spacing.md,
      borderRadius: theme.borderRadius.button,
      borderWidth: 1,
      borderColor: theme.colors.stoneSurface,
      alignItems: 'center',
      justifyContent: 'center',
    },
    retryButtonText: {
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.onSurfaceVariant,
    },
    addButton: {
      flex: 1,
      backgroundColor: theme.colors.midnight,
      borderRadius: theme.borderRadius.button,
      paddingVertical: theme.spacing.md,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
    },
    addButtonText: {
      color: theme.colors.white,
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.semibold,
    },
  });
}
