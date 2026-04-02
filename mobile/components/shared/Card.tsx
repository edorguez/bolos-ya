import { View, ViewProps, type ViewStyle } from 'react-native'
import { StyleSheet } from '../../styles/createStyleSheet'
import { useAppTheme } from '../../styles/theme'

interface CardProps extends ViewProps {
  variant?: 'elevated' | 'filled' | 'outlined'
}

const createStyles = StyleSheet.create(theme => ({
  container: {
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
  },
  elevated: {
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  filled: {
    backgroundColor: theme.colors.surfaceContainerLow,
  },
  outlined: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
  },
}))

export function Card({ variant = 'elevated', style, ...props }: CardProps) {
  const theme = useAppTheme()
  const styles = createStyles(theme)

  return (
    <View
      style={[
        styles.container as ViewStyle,
        variant === 'elevated' && (styles.elevated as ViewStyle),
        variant === 'filled' && (styles.filled as ViewStyle),
        variant === 'outlined' && (styles.outlined as ViewStyle),
        style,
      ]}
      {...props}
    />
  )
}
