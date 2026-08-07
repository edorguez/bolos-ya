import { type ReactNode } from 'react';
import { type StyleProp, type ViewStyle } from 'react-native';
import Animated from 'react-native-reanimated';
import { useFadeSlideIn } from '../../hooks/animations';

interface FadeInProps {
  children: ReactNode;
  delay?: number;
  distance?: number;
  style?: StyleProp<ViewStyle>;
}

export function FadeIn({ children, delay = 0, distance = 16, style }: FadeInProps) {
  const animatedStyle = useFadeSlideIn({ delay, distance });
  return <Animated.View style={[animatedStyle, style]}>{children}</Animated.View>;
}
