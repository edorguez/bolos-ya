import { View, Text, Pressable, type ViewStyle, type TextStyle } from 'react-native';
import { StyleSheet } from '../../styles/createStyleSheet';
import { useAppTheme } from '../../styles/theme';
import { MaterialIcons } from '@expo/vector-icons';

interface PremiumActiveCardProps {
  premiumUntil?: string | null;
  onUpgradePress?: () => void;
}

function getDaysRemaining(premiumUntil: string): number {
  const expiry = new Date(premiumUntil);
  const now = new Date();
  const diff = expiry.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

function formatDate(premiumUntil: string): string {
  const d = new Date(premiumUntil);
  return d.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

const stylesheet = StyleSheet.create(theme => ({
  card: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.xl,
    marginVertical: theme.spacing.lg,
    boxShadow: 'color(display-p3 0.94902 0.941176 0.929412) 0px 0px 0px 1px inset',
  },
  content: {
    gap: theme.spacing.md,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    backgroundColor: theme.colors.meadowGreen,
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
  daysText: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.charcoalPrimary,
    letterSpacing: theme.typography.letterSpacing.xl,
  },
  expiresText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.ash,
  },
  upgradeButton: {
    backgroundColor: theme.colors.midnight,
    borderRadius: theme.borderRadius.button,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    alignItems: 'center',
    marginTop: theme.spacing.sm,
  },
  upgradeButtonText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.white,
  },
}));

export function PremiumActiveCard({ premiumUntil, onUpgradePress }: PremiumActiveCardProps) {
  const theme = useAppTheme();
  const styles = stylesheet(theme);

  if (!premiumUntil) {
    return null;
  }

  const days = getDaysRemaining(premiumUntil);
  const expires = formatDate(premiumUntil);

  return (
    <View style={styles.card as ViewStyle}>
      <View style={styles.content as ViewStyle}>
        <View style={styles.badge as ViewStyle}>
          <MaterialIcons name="check-circle" size={14} color={theme.colors.white} />
          <Text style={styles.badgeText as TextStyle}>Premium activo</Text>
        </View>
        <Text style={styles.daysText as TextStyle}>
          Te quedan {days} {days === 1 ? 'día' : 'días'} de Premium
        </Text>
        <Text style={styles.expiresText as TextStyle}>
          Tu suscripción vence el {expires}
        </Text>
        <Pressable
          style={({ pressed }) => [
            styles.upgradeButton as ViewStyle,
            pressed ? { opacity: 0.8 } : undefined,
          ]}
          onPress={onUpgradePress}
        >
          <Text style={styles.upgradeButtonText as TextStyle}>Extender premium</Text>
        </Pressable>
      </View>
    </View>
  );
}
