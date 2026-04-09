import { View, Text, type ViewStyle, type TextStyle } from 'react-native'
import { StyleSheet } from '../../styles/createStyleSheet'
import { useAppTheme } from '../../styles/theme'
// @ts-ignore
import MaterialIcons from '@expo/vector-icons/build/MaterialIcons'
import { ProgressBar } from '../shared/ProgressBar'

interface BudgetSummaryProps {
  totalBs: number
  totalUsd: number
  budgetBs: number
  budgetUsd: number
}

const stylesheet = StyleSheet.create(theme => ({
  container: {
    marginBottom: theme.spacing.lg,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: theme.spacing.md,
  },
  totalAmount: {
    fontSize: theme.typography.fontSize.xxl,
    fontWeight: '800',
    color: theme.colors.onSurface,
  },
  totalUsd: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: '700',
    color: theme.colors.secondary,
  },
  budgetLabel: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: theme.colors.outline,
    textAlign: 'right',
    marginBottom: theme.spacing.xs,
  },
  budgetAmount: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.onSurface,
  },
  progressBarContainer: {
    marginBottom: theme.spacing.sm,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  badge: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
  },
  badgeText: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.errorContainer,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.error,
  },
  warningText: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: '700',
    color: theme.colors.error,
  },
}))

export function BudgetSummary({ totalBs, totalUsd, budgetBs, budgetUsd }: BudgetSummaryProps) {
  const theme = useAppTheme()
  const styles = stylesheet(theme)

  const isOverBudget = totalBs > budgetBs
  const overBudgetAmount = Math.max(0, totalBs - budgetBs)
  const progressPercentage = Math.min(100, (totalBs / budgetBs) * 100)

  return (
    <View style={styles.container as ViewStyle}>
      <View style={styles.totalRow as ViewStyle}>
        <View>
          <Text style={styles.totalAmount as TextStyle}>
            Bs. {totalBs.toLocaleString('es-VE', { minimumFractionDigits: 2 })}
          </Text>
          <Text style={styles.totalUsd as TextStyle}>
            ${totalUsd.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD
          </Text>
        </View>
        <View>
          <Text style={styles.budgetLabel as TextStyle}>LÍMITE</Text>
          <Text style={styles.budgetAmount as TextStyle}>
            Bs. {budgetBs.toLocaleString('es-VE', { minimumFractionDigits: 2 })}
          </Text>
          <Text style={[styles.budgetLabel as TextStyle, { marginBottom: 0 }]}>
            ${budgetUsd.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD
          </Text>
        </View>
      </View>

      <View style={styles.badgeRow as ViewStyle}>
        <View
          style={[
            styles.badge as ViewStyle,
            {
              backgroundColor: isOverBudget
                ? theme.colors.errorContainer
                : theme.colors.success + '20',
            },
          ]}
        >
          <Text
            style={[
              styles.badgeText as TextStyle,
              { color: isOverBudget ? theme.colors.error : theme.colors.success },
            ]}
          >
            {isOverBudget ? 'Excedido' : 'Bien'}
          </Text>
        </View>
      </View>

      <View style={styles.progressBarContainer as ViewStyle}>
        <ProgressBar
          progress={progressPercentage}
          color={isOverBudget ? theme.colors.error : theme.colors.primary}
          backgroundColor={theme.colors.surfaceContainer}
          height={12}
        />
      </View>

      {isOverBudget && (
        <View style={styles.warningContainer as ViewStyle}>
          <MaterialIcons name="warning" size={16} color={theme.colors.error} />
          <Text style={styles.warningText as TextStyle}>
            Te has excedido por Bs.{' '}
            {overBudgetAmount.toLocaleString('es-VE', { minimumFractionDigits: 2 })}
          </Text>
        </View>
      )}
    </View>
  )
}
