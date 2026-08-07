import { type ReactNode } from 'react';
import { Pressable, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import Animated from 'react-native-reanimated';
import { usePressSpring } from '../../hooks/animations';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface PressableScaleProps extends Omit<PressableProps, 'style'> {
  children: ReactNode;
  pressedScale?: number;
  style?: StyleProp<ViewStyle>;
}

export function PressableScale({
  children,
  pressedScale = 1.03,
  style,
  onPressIn,
  onPressOut,
  ...props
}: PressableScaleProps) {
  const {
    animatedStyle,
    onPressIn: springIn,
    onPressOut: springOut,
  } = usePressSpring(pressedScale);

  return (
    <AnimatedPressable
      style={[style, animatedStyle]}
      onPressIn={e => {
        springIn();
        onPressIn?.(e);
      }}
      onPressOut={e => {
        springOut();
        onPressOut?.(e);
      }}
      {...props}
    >
      {children}
    </AnimatedPressable>
  );
}
