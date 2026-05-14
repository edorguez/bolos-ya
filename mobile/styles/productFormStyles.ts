import { StyleSheet } from 'react-native';
import { AppTheme } from './theme';

export function createProductFormStyles(theme: AppTheme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      gap: theme.spacing.lg,
    },
    illustrationRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.lg,
    },
    iconContainer: {
      width: 64,
      height: 64,
      borderRadius: theme.borderRadius.xl,
      backgroundColor: theme.colors.stoneSurface,
      alignItems: 'center',
      justifyContent: 'center',
    },
    icon: {
      color: theme.colors.emberOrange,
    },
    title: {
      fontSize: theme.typography.fontSize.lg,
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.onSurface,
      letterSpacing: theme.typography.letterSpacing.lg,
    },
    subtitle: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.onSurfaceVariant,
      marginTop: theme.spacing.xs,
    },
    inputGroup: {
      gap: theme.spacing.sm,
    },
    label: {
      fontSize: theme.typography.fontSize.xs,
      fontWeight: theme.typography.fontWeight.semibold,
      textTransform: 'uppercase',
      letterSpacing: 1,
      color: theme.colors.onSurfaceVariant,
      marginLeft: theme.spacing.sm,
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
    priceInputContainer: {
      flex: 1,
      gap: theme.spacing.sm,
    },
    priceInputWrapper: {
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
    currencySymbol: {
      position: 'absolute',
      left: theme.spacing.md,
      top: '50%',
      transform: [{ translateY: -8 }],
      fontSize: theme.typography.fontSize.xs,
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.onSurfaceVariant,
    },
    syncContainer: {
      paddingTop: theme.spacing.md,
      paddingBottom: theme.spacing.md,
      alignSelf: 'center',
    },
    syncButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.colors.surfaceContainer,
      alignItems: 'center',
      justifyContent: 'center',
    },
    errorText: {
      fontSize: theme.typography.fontSize.xs,
      color: theme.colors.error,
      marginLeft: theme.spacing.sm,
      marginTop: theme.spacing.xs,
    },
    buttonContainer: {
      marginTop: 'auto',
    },
  });
}
