import { View, Text, type ViewStyle, type TextStyle } from 'react-native'
import { StyleSheet } from '../../styles/createStyleSheet'
// @ts-ignore
import MaterialIcons from '@expo/vector-icons/build/MaterialIcons'
import { StatusBadge } from './StatusBadge'
import { AmountCard } from './AmountCard'
import { ProgressBar } from '../shared/ProgressBar'
import { useAppTheme } from '../../styles/theme'

interface HistoryCardProps {
  storeName: string
  date: string
  icon: string
  iconColor: string
  status: string
  totalBs: string
  totalUsd: string
  budgetUsage: number
  exceeded: boolean
}

const stylesheet = StyleSheet.create(theme => ({
  card: {
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xl,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.04,
    shadowRadius: 40,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.lg,
  },
  storeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  storeIconContainer: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  storeDetails: {
    gap: theme.spacing.xs,
  },
  storeName: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.onSurface,
  },
  storeDate: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.outline,
  },
  amountGrid: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
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
    fontWeight: theme.typography.fontWeight.bold,
  },
  progressValue: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.bold,
  },
}))

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
}: HistoryCardProps) {
  const theme = useAppTheme()
  const styles = stylesheet(theme)

  return (
    <View style={styles.card as ViewStyle}>
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

      <View style={styles.amountGrid as ViewStyle}>
        <AmountCard label="Total Bs." value={totalBs} exceeded={exceeded} variant="bs" />
        <AmountCard label="Total USD" value={totalUsd} exceeded={exceeded} variant="usd" />
      </View>

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
          color={exceeded ? theme.colors.error : theme.colors.primary}
        />
      </View>
    </View>
  )
}
