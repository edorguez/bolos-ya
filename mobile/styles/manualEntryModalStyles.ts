import { StyleSheet, Dimensions } from 'react-native';
import { AppTheme } from './theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const MODAL_WIDTH = Math.min(SCREEN_WIDTH * 0.9, 400);

export function createManualEntryModalStyles(theme: AppTheme) {
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
      gap: theme.spacing.md,
    },
    headerTitle: {
      fontSize: theme.typography.fontSize.xs,
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.emberOrange,
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
    inputGroup: {
      gap: theme.spacing.xs,
    },
    label: {
      fontSize: theme.typography.fontSize.xxs,
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.onSurfaceVariant,
      textTransform: 'uppercase',
      letterSpacing: 1,
      marginLeft: theme.spacing.xs,
    },
    textInput: {
      backgroundColor: theme.colors.surfaceContainerLow,
      borderWidth: 1,
      borderColor: theme.colors.stoneSurface,
      borderRadius: theme.borderRadius.md,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.sm,
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.text,
    },
    priceRow: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
      alignItems: 'flex-end',
    },
    priceInputWrapper: {
      flex: 1,
      position: 'relative',
    },
    priceInput: {
      backgroundColor: theme.colors.surfaceContainerLow,
      borderWidth: 1,
      borderColor: theme.colors.stoneSurface,
      borderRadius: theme.borderRadius.md,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.sm,
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.text,
      textAlign: 'right',
    },
    currencyToggle: {
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.borderRadius.sm,
      backgroundColor: theme.colors.stoneSurface,
      minWidth: 60,
      alignItems: 'center',
    },
    currencyToggleActive: {
      backgroundColor: theme.colors.midnight,
    },
    currencyToggleText: {
      fontSize: theme.typography.fontSize.xs,
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.onSurfaceVariant,
    },
    currencyToggleTextActive: {
      color: theme.colors.white,
    },
    errorText: {
      color: theme.colors.emberOrange,
      fontSize: theme.typography.fontSize.xs,
      textAlign: 'center',
    },
    quantitySection: {
      backgroundColor: theme.colors.surfaceContainerLow,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.sm,
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
    },
    cancelButton: {
      flex: 1,
      paddingVertical: theme.spacing.md,
      borderRadius: theme.borderRadius.button,
      borderWidth: 1,
      borderColor: theme.colors.stoneSurface,
      alignItems: 'center',
      justifyContent: 'center',
    },
    cancelButtonText: {
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
      fontSize: theme.typography.fontSize.md,
      fontWeight: theme.typography.fontWeight.semibold,
    },
  });
}
