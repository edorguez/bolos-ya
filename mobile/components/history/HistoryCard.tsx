import {
  View,
  Text,
  Pressable,
  type ViewStyle,
  type TextStyle,
  type ViewProps,
} from 'react-native';
import { StyleSheet } from '../../styles/createStyleSheet';
import { StatusBadge } from './StatusBadge';
import { AmountCard } from './AmountCard';
import { ProgressBar } from '../shared/ProgressBar';
import { useAppTheme } from '../../styles/theme';
import { MaterialIcons } from '@expo/vector-icons';

interface HistoryCardProps {
  storeName: string;
  date: string;
  icon: string;
  iconColor: string;
  status: string;
  totalBs: string;
  totalUsd: string;
  budgetUsage: number;
  exceeded: boolean;
  hideAmounts?: boolean;
  onPress?: () => void;
  style?: ViewProps['style'];
}

const stylesheet = StyleSheet.create(theme => ({
  card: {
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.stoneSurface,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  storeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  storeIconContainer: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  storeDetails: {
    gap: theme.spacing.xs,
  },
  storeName: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.onSurface,
  },
  storeDate: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.outline,
  },
  amountGrid: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  progressSection: {
    gap: theme.spacing.xs,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressLabel: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  progressValue: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.semibold,
  },
}));

export function HistoryCard({
  storeName,
  date,
  icon,
  iconColor,
  status,
  totalBs,
  totalUsd,
  budgetUsage,
  exceeded,
  hideAmounts = false,
  onPress,
  style,
}: HistoryCardProps) {
  const theme = useAppTheme();
  const styles = stylesheet(theme);

  const content = (
    <>
      <View style={styles.header as ViewStyle}>
        <View style={styles.storeInfo as ViewStyle}>
          <View
            style={[styles.storeIconContainer as ViewStyle, { backgroundColor: iconColor + '20' }]}
          >
            <MaterialIcons name={icon as any} size={24} color={iconColor} />
          </View>
          <View style={styles.storeDetails as ViewStyle}>
            <Text style={styles.storeName as TextStyle}>{storeName}</Text>
            <Text style={styles.storeDate as TextStyle}>{date}</Text>
          </View>
        </View>
        <StatusBadge status={status} />
      </View>

      {!hideAmounts && (
        <View style={styles.amountGrid as ViewStyle}>
          <AmountCard label="Total Bs" value={totalBs} />
          <AmountCard label="Total USD" value={totalUsd} />
        </View>
      )}

      <View style={styles.progressSection as ViewStyle}>
        <View style={styles.progressHeader as ViewStyle}>
          <Text
            style={[
              styles.progressLabel as TextStyle,
              { color: exceeded ? theme.colors.error : theme.colors.onSurfaceVariant },
            ]}
          >
            {exceeded ? 'Alerta de Gasto' : 'Uso del Presupuesto'}
          </Text>
          <Text
            style={[
              styles.progressValue as TextStyle,
              { color: exceeded ? theme.colors.error : theme.colors.onSurface },
            ]}
          >
            {budgetUsage}%
          </Text>
        </View>
        <ProgressBar
          progress={Math.min(budgetUsage, 100)}
          color={exceeded ? theme.colors.error : theme.colors.midnight}
          backgroundColor={theme.colors.stoneSurface}
        />
      </View>
    </>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.card as ViewStyle,
          style,
          { transform: [{ scale: pressed ? 0.97 : 1 }] },
        ]}
      >
        {content}
      </Pressable>
    );
  }

  return <View style={[styles.card as ViewStyle, style]}>{content}</View>;
}
