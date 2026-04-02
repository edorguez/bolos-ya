import { View, Text, Pressable, type ViewStyle, type TextStyle } from 'react-native'
import { StyleSheet } from '../../styles/createStyleSheet'
// @ts-ignore
import MaterialIcons from '@expo/vector-icons/build/MaterialIcons'
import { useAppTheme } from '../../styles/theme'

interface PremiumCardProps {
  onUpgradePress?: () => void
}

const stylesheet = StyleSheet.create(theme => ({
  card: {
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: theme.colors.tertiaryContainer,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xl,
    marginVertical: theme.spacing.lg,
    shadowColor: theme.colors.tertiary,
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.2,
    shadowRadius: 30,
    elevation: 12,
  },
  blob: {
    position: 'absolute',
    right: -40,
    top: -40,
    width: 160,
    height: 160,
    backgroundColor: theme.colors.surfaceContainerLowest + '33',
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
    backgroundColor: '#583d00',
    alignSelf: 'flex-start',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: 9999,
  },
  badgeText: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.bold,
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  title: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: '#583d00',
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  featureText: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
    color: '#583d00CC',
  },
  upgradeButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.lg,
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
    marginTop: theme.spacing.md,
  },
  upgradeButtonText: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: '#FFFFFF',
  },
}))

export function PremiumCard({ onUpgradePress }: PremiumCardProps) {
  const theme = useAppTheme()
  const styles = stylesheet(theme)

  const premiumFeatures = ['OCR Scanner ilimitado', 'Unlimited Carts']

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
            <MaterialIcons name="check-circle" size={20} color={theme.colors.primary} />
            <Text style={styles.featureText as TextStyle}>{feature}</Text>
          </View>
        ))}
        <Pressable
          style={({ pressed }) => [
            styles.upgradeButton as ViewStyle,
            pressed && { transform: [{ scale: 0.95 }] },
          ]}
          onPress={onUpgradePress}
        >
          <Text style={styles.upgradeButtonText as TextStyle}>Mejorar ahora</Text>
        </Pressable>
      </View>
    </View>
  )
}
