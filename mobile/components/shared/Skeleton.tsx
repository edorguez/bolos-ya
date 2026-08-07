import { type ViewStyle, type StyleProp } from 'react-native';
import Animated from 'react-native-reanimated';
import { usePulse } from '../../hooks/animations';
import { useAppTheme } from '../../styles/theme';

interface SkeletonProps {
  width?: number | `${number}%`;
  height?: number;
  radius?: number;
  style?: StyleProp<ViewStyle>;
}

export function Skeleton({ width = '100%', height = 16, radius = 8, style }: SkeletonProps) {
  const theme = useAppTheme();
  const pulse = usePulse({ min: 0.45, max: 1, duration: 1000 });

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius: radius,
          backgroundColor: theme.colors.surfaceContainerHigh,
        },
        pulse,
        style,
      ]}
    />
  );
}
