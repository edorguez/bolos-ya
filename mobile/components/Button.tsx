import { Text, ActivityIndicator, type ViewStyle } from 'react-native';
import { useAppTheme } from '../styles/theme';
import { createButtonStyles } from '../styles/buttons';
import { PressableScale } from './shared/PressableScale';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  isLoading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
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
  const theme = useAppTheme();
  const buttonStyles = createButtonStyles(theme);

  const getButtonStyle = () => {
    const baseStyle = {
      ...buttonStyles.base,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      flexDirection: 'row' as const,
      width: fullWidth ? ('100%' as const) : undefined,
    };

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
    };

    const variantStyles = {
      primary: {
        backgroundColor: theme.colors.primary,
      },
      secondary: {
        backgroundColor: theme.colors.primaryContainer,
      },
      outline: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: theme.colors.graphite,
      },
    };

    const disabledStyles = disabled || isLoading ? { opacity: 0.6 } : {};

    return { ...baseStyle, ...sizeStyles[size], ...variantStyles[variant], ...disabledStyles };
  };

  const getTextStyle = () => {
    const baseStyle = {
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.medium as '500',
    };

    const variantTextStyles = {
      primary: { color: theme.colors.onPrimary },
      secondary: { color: theme.colors.onPrimaryContainer },
      outline: { color: theme.colors.graphite },
    };

    return { ...baseStyle, ...variantTextStyles[variant] };
  };

  return (
    <PressableScale
      style={getButtonStyle() as ViewStyle}
      onPress={onPress}
      disabled={disabled || isLoading}
    >
      {isLoading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'outline' ? theme.colors.graphite : theme.colors.onPrimary}
        />
      ) : (
        <Text style={getTextStyle()}>{title}</Text>
      )}
    </PressableScale>
  );
}
