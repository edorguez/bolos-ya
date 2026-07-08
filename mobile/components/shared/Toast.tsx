import { useEffect, useRef } from 'react';
import { View, Text, Animated, type TextStyle, type ViewStyle } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { StyleSheet } from '../../styles/createStyleSheet';
import { useAppTheme } from '../../styles/theme';

interface ToastProps {
  message: string | null;
  onDismiss: () => void;
  duration?: number;
  position?: 'top' | 'bottom';
  isError?: boolean;
}

const stylesheet = StyleSheet.create(theme => ({
  container: {
    position: 'absolute',
    left: theme.spacing.lg,
    right: theme.spacing.lg,
    bottom: 60,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    zIndex: 9999,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
  },
  text: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    textAlign: 'center',
  },
}));

export function Toast({
  message,
  onDismiss,
  duration = 4000,
  position = 'bottom',
  isError = true,
}: ToastProps) {
  const theme = useAppTheme();
  const styles = stylesheet(theme);
  const opacity = useRef(new Animated.Value(0)).current;
  const positionStyle = position === 'top' ? { bottom: undefined, top: 60 } : undefined;
  const bgColor = isError ? theme.colors.error : theme.colors.success;

  useEffect(() => {
    if (message) {
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.delay(duration),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => onDismiss());
    }
  }, [message, duration, opacity, onDismiss]);

  if (!message) return null;

  return (
    <Animated.View
      style={[styles.container as ViewStyle, positionStyle, { opacity, backgroundColor: bgColor }]}
    >
      <View style={styles.row as ViewStyle}>
        <MaterialIcons
          name={isError ? 'error' : 'check-circle'}
          size={20}
          color={theme.colors.white}
        />
        <Text style={styles.text as TextStyle}>{message}</Text>
      </View>
    </Animated.View>
  );
}
