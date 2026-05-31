import { useEffect, useRef } from 'react';
import { Text, Animated, type TextStyle } from 'react-native';
import { StyleSheet } from '../../styles/createStyleSheet';
import { useAppTheme } from '../../styles/theme';

interface ToastProps {
  message: string | null;
  onDismiss: () => void;
  duration?: number;
  position?: 'top' | 'bottom';
}

const stylesheet = StyleSheet.create(theme => ({
  container: {
    position: 'absolute',
    left: theme.spacing.lg,
    right: theme.spacing.lg,
    bottom: 60,
    backgroundColor: theme.colors.error,
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
  text: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    textAlign: 'center',
  },
}));

export function Toast({ message, onDismiss, duration = 4000, position = 'bottom' }: ToastProps) {
  const theme = useAppTheme();
  const styles = stylesheet(theme);
  const opacity = useRef(new Animated.Value(0)).current;
  const positionStyle = position === 'top' ? { bottom: undefined, top: 60 } : undefined;

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
    <Animated.View style={[styles.container as any, positionStyle, { opacity }]}>
      <Text style={styles.text as TextStyle}>{message}</Text>
    </Animated.View>
  );
}
