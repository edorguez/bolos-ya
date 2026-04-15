import { StyleSheet } from 'react-native'
import { AppTheme } from './theme'

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
      backgroundColor: theme.colors.secondaryContainer,
      alignItems: 'center',
      justifyContent: 'center',
    },
    icon: {
      color: theme.colors.secondary,
    },
    title: {
      fontSize: theme.typography.fontSize.xl,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.onSurface,
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
      fontWeight: theme.typography.fontWeight.bold,
      textTransform: 'uppercase',
      letterSpacing: 1,
      color: theme.colors.onSurfaceVariant,
      marginLeft: theme.spacing.sm,
    },
    textInput: {
      backgroundColor: theme.colors.surfaceContainerLow,
      borderWidth: 0,
      borderRadius: theme.borderRadius.md,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      fontSize: theme.typography.fontSize.xs,
      color: theme.colors.onSurface,
      fontWeight: theme.typography.fontWeight.bold,
    },
    quantitySection: {
      backgroundColor: theme.colors.surfaceContainerLow,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
    },
    quantityControls: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: theme.spacing.lg,
      backgroundColor: theme.colors.surfaceContainerLowest,
      borderRadius: theme.borderRadius.full,
      padding: theme.spacing.xs,
      shadowColor: theme.colors.onSurface,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
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
      fontWeight: '800',
      minWidth: 32,
      textAlign: 'center',
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
      borderWidth: 0,
      borderRadius: theme.borderRadius.md,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      fontSize: theme.typography.fontSize.xs,
      color: theme.colors.onSurface,
      fontWeight: theme.typography.fontWeight.bold,
      textAlign: 'right',
    },
    currencySymbol: {
      position: 'absolute',
      left: theme.spacing.md,
      top: '50%',
      transform: [{ translateY: -8 }], // Half of font size
      fontSize: theme.typography.fontSize.xs,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.onSurfaceVariant,
    },
    syncContainer: {
      paddingTop: theme.spacing.md,
      paddingBottom: theme.spacing.md,
      alignSelf: 'center'
    },
    syncButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.colors.surfaceContainerHigh,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: theme.colors.primary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
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
  })
}
