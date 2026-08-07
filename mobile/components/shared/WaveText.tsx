import { useEffect } from 'react';
import { View, type TextStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withRepeat,
  withDelay,
  cancelAnimation,
  Easing,
  type SharedValue,
} from 'react-native-reanimated';
import { usePrefersReducedMotion } from '../../hooks/animations';

interface WaveTextProps {
  text: string;
  style?: TextStyle;
  amplitude?: number;
  duration?: number;
  pause?: number;
}

function WaveLetter({
  letter,
  index,
  count,
  progress,
  style,
  amplitude,
}: {
  letter: string;
  index: number;
  count: number;
  progress: SharedValue<number>;
  style?: TextStyle;
  amplitude: number;
}) {
  const animatedStyle = useAnimatedStyle(() => {
    const phase = index / count;
    const envelope = Math.sin(progress.get() * Math.PI);
    const y = Math.sin((progress.get() - phase) * Math.PI * 2) * -amplitude * envelope;
    return { transform: [{ translateY: y }] };
  });

  return <Animated.Text style={[style, animatedStyle]}>{letter}</Animated.Text>;
}

export function WaveText({
  text,
  style,
  amplitude = 5,
  duration = 1400,
  pause = 1000,
}: WaveTextProps) {
  const reduced = usePrefersReducedMotion();
  const progress = useSharedValue(0);
  const letters = text.split('');

  useEffect(() => {
    if (reduced) {
      progress.set(0);
      return;
    }
    progress.set(0);
    progress.set(
      withRepeat(
        withSequence(
          withTiming(1, { duration, easing: Easing.linear }),
          withDelay(pause, withTiming(0, { duration: 0 }))
        ),
        -1,
        false
      )
    );
    return () => cancelAnimation(progress);
  }, [reduced, duration, pause, progress]);

  return (
    <View style={{ flexDirection: 'row' }}>
      {letters.map((letter, index) => (
        <WaveLetter
          key={`${letter}-${index}`}
          letter={letter}
          index={index}
          count={letters.length}
          progress={progress}
          style={style}
          amplitude={amplitude}
        />
      ))}
    </View>
  );
}
