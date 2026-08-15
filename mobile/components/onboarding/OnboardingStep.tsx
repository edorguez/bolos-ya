import { type ReactNode } from 'react';
import {
  View,
  Text,
  StyleSheet,
  useWindowDimensions,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Animated from 'react-native-reanimated';
import { Image } from 'expo-image';
import { useAppTheme } from '../../styles/theme';
import { useScaleIn, useFadeSlideIn, useFloat } from '../../hooks/animations';

interface OnboardingStepProps {
  image: number;
  title: string;
  titleAccent?: string;
  subtitle: string;
  imageAnimatedStyle?: StyleProp<ViewStyle>;
  imageOverlay?: (cardHeight: number) => ReactNode;
}

export function OnboardingStep({
  image,
  title,
  titleAccent,
  subtitle,
  imageAnimatedStyle,
  imageOverlay,
}: OnboardingStepProps) {
  const theme = useAppTheme();
  const { height } = useWindowDimensions();
  const cardHeight = Math.min(height * 0.42, 320);
  const bubbleSize = Math.min(cardHeight * 0.78, 260);
  const mascotHeight = bubbleSize * 0.58;

  const imageEnter = useScaleIn({ delay: 80, from: 0.6 });
  const bubbleFloat = useFloat({ distance: 6, duration: 3000 });
  const titleEnter = useFadeSlideIn({ delay: 160, distance: 18 });
  const subtitleEnter = useFadeSlideIn({ delay: 280, distance: 16 });

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    body: {
      flex: 1,
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.lg,
    },
    imageCard: {
      width: '100%',
      borderRadius: theme.borderRadius.xl,
      backgroundColor: theme.colors.stoneSurface,
      overflow: 'hidden',
      position: 'relative',
      borderCurve: 'continuous',
    },
    blob1: {
      position: 'absolute',
      top: -80,
      right: -40,
      width: 220,
      height: 220,
      borderRadius: theme.borderRadius.full,
      backgroundColor: `${theme.colors.emberOrange}0d`,
    },
    blob2: {
      position: 'absolute',
      bottom: -60,
      left: -50,
      width: 200,
      height: 200,
      borderRadius: theme.borderRadius.full,
      backgroundColor: `${theme.colors.skyBlue}0f`,
    },
    blob3: {
      position: 'absolute',
      top: '30%',
      left: -20,
      width: 120,
      height: 120,
      borderRadius: theme.borderRadius.full,
      backgroundColor: `${theme.colors.meadowGreen}0a`,
    },
    imageWrap: {
      width: '100%',
      height: '100%',
      alignItems: 'center',
      justifyContent: 'center',
    },
    bubble: {
      width: bubbleSize,
      height: bubbleSize,
      borderRadius: theme.borderRadius.full,
      backgroundColor: theme.colors.white,
      boxShadow: theme.shadows.soft,
      overflow: 'hidden',
      alignItems: 'center',
      justifyContent: 'center',
      borderCurve: 'continuous',
    },
    mascotWrap: {
      width: '100%',
      height: mascotHeight,
      alignItems: 'center',
      justifyContent: 'center',
    },
    image: {
      width: '100%',
      height: '100%',
    },
    overlayWrap: {
      ...StyleSheet.absoluteFillObject,
    },
    content: {
      alignItems: 'center',
      marginTop: theme.spacing.xl,
    },
    title: {
      fontSize: theme.typography.fontSize.xl,
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.charcoalPrimary,
      lineHeight: 32,
      letterSpacing: theme.typography.letterSpacing.xl,
      textAlign: 'center',
    },
    titleAccent: {
      color: theme.colors.emberOrange,
    },
    subtitle: {
      fontSize: theme.typography.fontSize.md,
      lineHeight: 24,
      color: theme.colors.textSecondary,
      letterSpacing: theme.typography.letterSpacing.md,
      textAlign: 'center',
      maxWidth: 340,
      marginTop: theme.spacing.sm,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.body}>
        <View style={[styles.imageCard, { height: cardHeight }]}>
          <View style={styles.blob1} />
          <View style={styles.blob2} />
          <View style={styles.blob3} />
          <View style={styles.imageWrap}>
            <Animated.View style={[styles.bubble, bubbleFloat]}>
              <Animated.View style={[styles.mascotWrap, imageEnter, imageAnimatedStyle]}>
                <Image
                  source={image}
                  style={styles.image}
                  contentFit="contain"
                  transition={200}
                  accessibilityIgnoresInvertColors
                />
              </Animated.View>
              {imageOverlay ? (
                <View style={styles.overlayWrap} pointerEvents="none">
                  {imageOverlay(mascotHeight)}
                </View>
              ) : null}
            </Animated.View>
          </View>
        </View>

        <View style={styles.content}>
          <Animated.View style={titleEnter}>
            <Text style={styles.title}>
              {title}
              {titleAccent ? <Text style={styles.titleAccent}>{titleAccent}</Text> : null}
            </Text>
          </Animated.View>
          <Animated.View style={subtitleEnter}>
            <Text style={styles.subtitle}>{subtitle}</Text>
          </Animated.View>
        </View>
      </View>
    </View>
  );
}
