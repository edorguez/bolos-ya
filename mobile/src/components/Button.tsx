import { Pressable, Text, ActivityIndicator } from 'react-native'
import { useAppTheme } from '../styles/theme'

interface ButtonProps {
  title: string
  onPress: () => void
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'small' | 'medium' | 'large'
  isLoading?: boolean
  disabled?: boolean
  fullWidth?: boolean
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  isLoading = false,
  disabled = false,
  fullWidth = false,
}: ButtonProps) {
  const theme = useAppTheme()

  const getButtonStyle = () => {
    const baseStyle = {
      borderRadius: theme.borderRadius.md,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      flexDirection: 'row' as const,
      width: fullWidth ? ('100%' as const) : undefined,
    }

    const sizeStyles = {
      small: {
        paddingHorizontal: theme.spacing.sm,
        paddingVertical: theme.spacing.xs,
      },
      medium: {
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.sm,
      },
      large: {
        paddingHorizontal: theme.spacing.lg,
        paddingVertical: theme.spacing.md,
      },
    }

    const variantStyles = {
      primary: {
        backgroundColor: theme.colors.primary,
      },
      secondary: {
        backgroundColor: theme.colors.secondary,
      },
      outline: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: theme.colors.primary,
      },
    }

    const disabledStyles = disabled || isLoading ? { opacity: 0.6 } : {}

    return { ...baseStyle, ...sizeStyles[size], ...variantStyles[variant], ...disabledStyles }
  }

  const getTextStyle = () => {
    const baseStyle = {
      fontSize: theme.typography.fontSize.md,
      fontWeight: theme.typography.fontWeight.medium as '500',
    }

    const variantTextStyles = {
      primary: { color: '#FFFFFF' },
      secondary: { color: '#FFFFFF' },
      outline: { color: theme.colors.primary },
    }

    return { ...baseStyle, ...variantTextStyles[variant] }
  }

  return (
    <Pressable
      style={getButtonStyle()}
      onPress={onPress}
      disabled={disabled || isLoading}
    >
      {isLoading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'outline' ? theme.colors.primary : '#FFFFFF'}
        />
      ) : (
        <Text style={getTextStyle()}>{title}</Text>
      )}
    </Pressable>
  )
}