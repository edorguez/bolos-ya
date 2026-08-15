import { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  withDelay,
  cancelAnimation,
  interpolate,
  Easing,
} from 'react-native-reanimated';
import { useFloat, usePrefersReducedMotion } from '../../hooks/animations';
import { useAppTheme } from '../../styles/theme';
import { OnboardingStep } from '../../components/onboarding/OnboardingStep';
import IMAGE from '../../assets/onboarding/merki_scan.png';

const SWEEP_HEIGHT = 3;

function ScanSweep({ height }: { height: number }) {
  const theme = useAppTheme();
  const reduced = usePrefersReducedMotion();
  const progress = useSharedValue(-1);

  useEffect(() => {
    if (reduced) {
      progress.set(-1);
      return;
    }
    progress.set(-1);
    progress.set(
      withRepeat(
        withSequence(
          withTiming(1, { duration: 2400, easing: Easing.inOut(Easing.ease) }),
          withDelay(800, withTiming(-1, { duration: 0 }))
        ),
        -1,
        false
      )
    );
    return () => cancelAnimation(progress);
  }, [reduced, progress]);

  const sweepStyle = useAnimatedStyle(() => {
    const t = (progress.get() + 1) / 2;
    return {
      transform: [{ translateY: t * (height - SWEEP_HEIGHT) }],
      opacity: interpolate(t, [0, 0.08, 0.92, 1], [0, 1, 1, 0]),
    };
  });

  return (
    <View style={styles.sweepContainer} pointerEvents="none">
      <Animated.View
        style={[
          styles.sweepLine,
          { backgroundColor: theme.colors.skyBlue, boxShadow: theme.shadows.soft },
          sweepStyle,
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  sweepContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    overflow: 'hidden',
  },
  sweepLine: {
    position: 'absolute',
    top: 0,
    height: SWEEP_HEIGHT,
    width: '82%',
    borderRadius: 2,
  },
});

export default function OnboardingStep3() {
  const float = useFloat({ distance: 10, duration: 3200 });

  return (
    <OnboardingStep
      image={IMAGE}
      title="Escanea el "
      titleAccent="precio"
      subtitle="Toma una foto del precio y regístralo en USD o Bs en segundos, sin escribir nada."
      imageAnimatedStyle={float}
      imageOverlay={cardHeight => <ScanSweep height={cardHeight} />}
    />
  );
}
