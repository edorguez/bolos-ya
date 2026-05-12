import { View, Text, Pressable, type ViewStyle, type TextStyle } from 'react-native';
import { StyleSheet } from '../../styles/createStyleSheet';
import { useAppTheme } from '../../styles/theme';
import { MaterialIcons } from '@expo/vector-icons';

interface PremiumCardProps {
  onUpgradePress?: () => void;
}

const stylesheet = StyleSheet.create(theme => ({
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
    backgroundColor: '#ffffff33',
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
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  title: {
    fontSize: theme.typography.fontSize.xl,
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
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.pepper,
    opacity: 0.8,
  },
  upgradeButton: {
    backgroundColor: theme.colors.midnight,
    borderRadius: theme.borderRadius.button,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    alignItems: 'center',
  },
  upgradeButtonText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: '#FFFFFF',
  },
}));

export function PremiumCard({ onUpgradePress }: PremiumCardProps) {
  const theme = useAppTheme();
  const styles = stylesheet(theme);

  const premiumFeatures = ['OCR Scanner ilimitado', 'Unlimited Carts'];

  return (
    <View style={styles.card as ViewStyle}>
      <View style={styles.blob as ViewStyle} />
      <View style={styles.content as ViewStyle}>
        <View style={styles.badge as ViewStyle}>
          <MaterialIcons name="stars" size={14} color="#FFFFFF" />
          <Text style={styles.badgeText as TextStyle}>Premium</Text>
        </View>
        <Text style={styles.title as TextStyle}>Hazte Premium por $3.99/mes</Text>
        {premiumFeatures.map((feature, index) => (
          <View key={index} style={styles.feature as ViewStyle}>
            <MaterialIcons name="check-circle" size={20} color={theme.colors.meadowGreen} />
            <Text style={styles.featureText as TextStyle}>{feature}</Text>
          </View>
        ))}
        <Pressable
          style={({ pressed }) => [
            styles.upgradeButton as ViewStyle,
            pressed ? { opacity: 0.8 } : undefined,
          ]}
          onPress={onUpgradePress}
        >
          <Text style={styles.upgradeButtonText as TextStyle}>Mejorar ahora</Text>
        </Pressable>
      </View>
    </View>
  );
}
