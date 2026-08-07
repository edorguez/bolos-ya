import { useEffect } from 'react';
import { View, ViewProps, type ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { StyleSheet } from '../../styles/createStyleSheet';
import { useAppTheme } from '../../styles/theme';

interface ProgressBarProps extends ViewProps {
  progress: number;
  color?: string;
  backgroundColor?: string;
  height?: number;
}

const stylesheet = StyleSheet.create(theme => ({
  container: {
    backgroundColor: theme.colors.surfaceContainer,
    borderRadius: theme.borderRadius.full,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    width: '100%',
    borderRadius: theme.borderRadius.full,
  },
}));

export function ProgressBar({
  progress,
  color,
  backgroundColor,
  height = 8,
  style,
  ...props
}: ProgressBarProps) {
  const theme = useAppTheme();
  const styles = stylesheet(theme);
  const fillColor = color || theme.colors.midnight;
  const clamped = Math.min(Math.max(progress, 0), 100);
  const progressValue = useSharedValue(0);

  useEffect(() => {
    progressValue.set(
      withTiming(clamped / 100, { duration: 700, easing: Easing.out(Easing.cubic) })
    );
  }, [clamped, progressValue]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scaleX: progressValue.get() }],
  }));

  return (
    <View style={[styles.container as ViewStyle, { height, backgroundColor }, style]} {...props}>
      <Animated.View
        style={[
          styles.fill as ViewStyle,
          { backgroundColor: fillColor, transformOrigin: 'left' },
          animatedStyle,
        ]}
      />
    </View>
  );
}
