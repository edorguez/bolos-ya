import { type ReactNode } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Animated from 'react-native-reanimated';
import { Image } from 'expo-image';
import { MaterialIcons } from '@expo/vector-icons';
import { useAppTheme } from '../../styles/theme';
import { Button } from '../Button';
import { ProgressBar } from '../shared/ProgressBar';
import { useScaleIn, useFadeSlideIn } from '../../hooks/animations';

interface OnboardingStepProps {
  image: number;
  title: string;
  titleAccent?: string;
  subtitle: string;
  nextLabel?: string;
  onNext: () => void;
  stepIndex: number;
  totalSteps: number;
  imageAnimatedStyle?: StyleProp<ViewStyle>;
  imageOverlay?: (cardHeight: number) => ReactNode;
  showBack?: boolean;
  onBack?: () => void;
}

export function OnboardingStep({
  image,
  title,
  titleAccent,
  subtitle,
  nextLabel = 'Siguiente',
  onNext,
  stepIndex,
  totalSteps,
  imageAnimatedStyle,
  imageOverlay,
  showBack = false,
  onBack,
}: OnboardingStepProps) {
  const theme = useAppTheme();
  const { height } = useWindowDimensions();
  const cardHeight = Math.min(height * 0.42, 320);

  const imageEnter = useScaleIn({ delay: 80, from: 0.6 });
  const titleEnter = useFadeSlideIn({ delay: 160, distance: 18 });
  const subtitleEnter = useFadeSlideIn({ delay: 280, distance: 16 });
  const buttonEnter = useFadeSlideIn({ delay: 420, distance: 16 });

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.lg,
    },
    headerSpacer: {
      width: 40,
    },
    backButton: {
      width: 40,
      height: 40,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: theme.borderRadius.full,
    },
    stepLabel: {
      fontSize: theme.typography.fontSize.xs,
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.textSecondary,
      letterSpacing: 0.5,
      textTransform: 'uppercase',
    },
    progressWrap: {
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.sm,
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
    footer: {
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.xl,
      paddingBottom: theme.spacing.lg,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {showBack ? (
          <Pressable
            onPress={onBack}
            hitSlop={12}
            style={({ pressed }) => [styles.backButton, pressed && { opacity: 0.6 }]}
          >
            <MaterialIcons name="arrow-back" size={24} color={theme.colors.text} />
          </Pressable>
        ) : (
          <View style={styles.headerSpacer} />
        )}

        <Text style={styles.stepLabel}>
          Paso {stepIndex} de {totalSteps}
        </Text>

        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.progressWrap}>
        <ProgressBar progress={(stepIndex / totalSteps) * 100} height={5} />
      </View>

      <View style={styles.body}>
        <View style={[styles.imageCard, { height: cardHeight }]}>
          <View style={styles.blob1} />
          <View style={styles.blob2} />
          <View style={styles.blob3} />
          <Animated.View style={[styles.imageWrap, imageEnter, imageAnimatedStyle]}>
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
              {imageOverlay(cardHeight)}
            </View>
          ) : null}
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

      <View style={styles.footer}>
        <Animated.View style={buttonEnter}>
          <Button title={nextLabel} onPress={onNext} size="large" fullWidth />
        </Animated.View>
      </View>
    </View>
  );
}
