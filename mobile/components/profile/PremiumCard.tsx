import { View, Text, type ViewStyle, type TextStyle } from 'react-native';
import Animated from 'react-native-reanimated';
import { StyleSheet } from '../../styles/createStyleSheet';
import { useAppTheme } from '../../styles/theme';
import { createButtonStyles } from '../../styles/buttons';
import { useFloat } from '../../hooks/animations';
import { PressableScale } from '../shared/PressableScale';
import { MaterialIcons } from '@expo/vector-icons';

interface PremiumCardProps {
  onUpgradePress?: () => void;
}

const stylesheet = StyleSheet.create(theme => {
  const buttonStyles = createButtonStyles(theme);
  return {
    card: {
      position: 'relative',
      overflow: 'hidden',
      backgroundColor: theme.colors.sunburstYellow,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.xl,
      marginVertical: theme.spacing.lg,
    },
    blob: {
      position: 'absolute',
      right: -40,
      top: -40,
      width: 160,
      height: 160,
      backgroundColor: theme.colors.white + '33',
      borderRadius: 9999,
    },
    content: {
      position: 'relative',
      zIndex: 10,
      gap: theme.spacing.md,
    },
    badge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
      backgroundColor: theme.colors.deepAmber,
      alignSelf: 'flex-start',
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.borderRadius.sm,
    },
    badgeText: {
      fontSize: theme.typography.fontSize.xs,
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.white,
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
    title: {
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.pepper,
      letterSpacing: theme.typography.letterSpacing.xl,
    },
    feature: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    featureText: {
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.medium,
      color: theme.colors.pepper,
      opacity: 0.8,
    },
    upgradeButton: {
      ...buttonStyles.base,
      backgroundColor: theme.colors.midnight,
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
      alignItems: 'center',
    },
    upgradeButtonText: {
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.medium,
      color: theme.colors.white,
    },
  };
});

export function PremiumCard({ onUpgradePress }: PremiumCardProps) {
  const theme = useAppTheme();
  const styles = stylesheet(theme);
  const blobFloat = useFloat({ distance: 8, duration: 3400 });

  const premiumFeatures = ['OCR Scanner ilimitado', 'Unlimited Carts'];

  return (
    <View style={styles.card as ViewStyle}>
      <Animated.View style={[styles.blob as ViewStyle, blobFloat]} />
      <View style={styles.content as ViewStyle}>
        <View style={styles.badge as ViewStyle}>
          <MaterialIcons name="stars" size={14} color={theme.colors.white} />
          <Text style={styles.badgeText as TextStyle}>Premium</Text>
        </View>
        <Text style={styles.title as TextStyle}>Hazte Premium por $3.99/mes</Text>
        {premiumFeatures.map((feature, index) => (
          <View key={index} style={styles.feature as ViewStyle}>
            <MaterialIcons name="check-circle" size={20} color={theme.colors.meadowGreen} />
            <Text style={styles.featureText as TextStyle}>{feature}</Text>
          </View>
        ))}
        <PressableScale
          pressedScale={1.03}
          style={styles.upgradeButton as ViewStyle}
          onPress={onUpgradePress}
        >
          <Text style={styles.upgradeButtonText as TextStyle}>Mejorar ahora</Text>
        </PressableScale>
      </View>
    </View>
  );
}
