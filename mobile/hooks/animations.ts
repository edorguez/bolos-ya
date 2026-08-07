import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';
import {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withRepeat,
  withSequence,
  withDelay,
  cancelAnimation,
  interpolate,
  Easing,
} from 'react-native-reanimated';

const EASE_OUT = Easing.out(Easing.cubic);

export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled().then(enabled => {
      if (mounted) setReduced(enabled);
    });
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', enabled => {
      if (mounted) setReduced(enabled);
    });
    return () => {
      mounted = false;
      sub.remove();
    };
  }, []);
  return reduced;
}

export function useFadeSlideIn(opts?: { delay?: number; distance?: number; duration?: number }) {
  const { delay = 0, distance = 16, duration = 400 } = opts ?? {};
  const reduced = usePrefersReducedMotion();
  const progress = useSharedValue(0);

  useEffect(() => {
    if (reduced) {
      progress.set(1);
      return;
    }
    progress.set(0);
    progress.set(withDelay(delay, withTiming(1, { duration, easing: EASE_OUT })));
  }, [delay, duration, reduced, progress]);

  const animatedStyle = useAnimatedStyle(() => {
    const t = progress.get();
    return {
      opacity: t,
      transform: [{ translateY: (1 - t) * distance }],
    };
  });

  return animatedStyle;
}

export function useScaleIn(opts?: { delay?: number; from?: number }) {
  const { delay = 0, from = 0.5 } = opts ?? {};
  const reduced = usePrefersReducedMotion();
  const progress = useSharedValue(0);

  useEffect(() => {
    if (reduced) {
      progress.set(1);
      return;
    }
    progress.set(0);
    progress.set(withDelay(delay, withSpring(1, { damping: 12, stiffness: 180, mass: 0.9 })));
  }, [delay, reduced, progress]);

  const animatedStyle = useAnimatedStyle(() => {
    const t = progress.get();
    return {
      opacity: t,
      transform: [{ scale: from + (1 - from) * t }],
    };
  });

  return animatedStyle;
}

export function usePulse(opts?: { min?: number; max?: number; duration?: number }) {
  const { min = 0.55, max = 1, duration = 1100 } = opts ?? {};
  const reduced = usePrefersReducedMotion();
  const progress = useSharedValue(0);

  useEffect(() => {
    if (reduced) {
      progress.set(max);
      return;
    }
    progress.set(min);
    progress.set(
      withRepeat(withTiming(max, { duration, easing: Easing.inOut(Easing.ease) }), -1, true)
    );
    return () => cancelAnimation(progress);
  }, [min, max, duration, reduced, progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: progress.get(),
  }));

  return animatedStyle;
}

export function usePressSpring(target = 1.03) {
  const progress = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + (target - 1) * progress.get() }],
  }));

  const onPressIn = () => {
    progress.set(withSpring(1, { damping: 14, stiffness: 320, mass: 0.8 }));
  };

  const onPressOut = () => {
    progress.set(withSpring(0, { damping: 14, stiffness: 320, mass: 0.8 }));
  };

  return { animatedStyle, onPressIn, onPressOut };
}

export function useFloat(opts?: { distance?: number; duration?: number }) {
  const { distance = 6, duration = 2600 } = opts ?? {};
  const reduced = usePrefersReducedMotion();
  const progress = useSharedValue(0);

  useEffect(() => {
    if (reduced) {
      progress.set(0);
      return;
    }
    progress.set(0);
    progress.set(
      withRepeat(withTiming(1, { duration, easing: Easing.inOut(Easing.ease) }), -1, true)
    );
    return () => cancelAnimation(progress);
  }, [distance, duration, reduced, progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: interpolate(progress.get(), [0, 1], [0, -distance]) }],
  }));

  return animatedStyle;
}

function formatAmount(value: number, decimals: number): string {
  const fixed = Math.abs(value).toFixed(decimals);
  const [intPart, decPart] = fixed.split('.');
  const withDots = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const sign = value < 0 ? '-' : '';
  return decimals > 0 ? `${sign}${withDots},${decPart}` : `${sign}${withDots}`;
}

export function useCountUp(opts: {
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
}): string {
  const { value, decimals = 2, prefix = '', suffix = '', duration = 750 } = opts;
  const reduced = usePrefersReducedMotion();
  const [display, setDisplay] = useState(() => formatAmount(value, decimals));

  useEffect(() => {
    if (reduced) {
      setDisplay(formatAmount(value, decimals));
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(formatAmount(value * eased, decimals));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, decimals, duration, reduced]);

  return `${prefix}${display}${suffix}`;
}

export function useHeartbeat(opts?: { to?: number; beat?: number; rest?: number }) {
  const { to = 1.12, beat = 200, rest = 2480 } = opts ?? {};
  const reduced = usePrefersReducedMotion();
  const progress = useSharedValue(1);

  useEffect(() => {
    if (reduced) {
      progress.set(1);
      return;
    }
    progress.set(1);
    progress.set(
      withRepeat(
        withSequence(
          withTiming(to, { duration: beat, easing: Easing.out(Easing.quad) }),
          withTiming(1, { duration: beat * 1.6, easing: Easing.inOut(Easing.quad) }),
          withDelay(rest, withTiming(1, { duration: 0 }))
        ),
        -1,
        false
      )
    );
    return () => cancelAnimation(progress);
  }, [to, beat, rest, reduced, progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: progress.get() }],
  }));

  return animatedStyle;
}
