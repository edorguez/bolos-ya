import { View, Text, type ViewStyle, type TextStyle } from 'react-native'
import { StyleSheet } from '../../styles/createStyleSheet'
import { useAppTheme } from '../../styles/theme'
import { ProgressBar } from '../shared/ProgressBar'
import { MaterialIcons } from '@expo/vector-icons'

interface BudgetSummaryProps {
  totalBs: number
  totalUsd: number
  budgetBs: number
  budgetUsd: number
}

const stylesheet = StyleSheet.create(theme => ({
  container: {
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.stoneSurface,
    marginBottom: theme.spacing.md,
  },
  limitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  limitLabel: {
    fontSize: theme.typography.fontSize.xxs,
    fontWeight: theme.typography.fontWeight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: theme.colors.onSurfaceVariant,
  },
  limitUsd: {
    fontSize: theme.typography.fontSize.xxs,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.onSurfaceVariant,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: theme.spacing.sm,
  },
  totalLeft: {
    flex: 1,
  },
  totalLabel: {
    fontSize: theme.typography.fontSize.xxs,
    fontWeight: theme.typography.fontWeight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: theme.colors.onSurfaceVariant,
    marginBottom: theme.spacing.xs,
  },
  totalAmountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  totalBs: {
    fontSize: 28,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.onSurface,
  },
  totalUsd: {
    fontSize: 14,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.onSurfaceVariant,
  },
  progressBarContainer: {
    marginBottom: theme.spacing.sm,
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: theme.spacing.xs,
    backgroundColor: theme.colors.coralRed + '08',
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.coralRed + '20',
  },
  warningText: {
    fontSize: 11,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.error,
  },
}))

export function BudgetSummary({ totalBs, totalUsd, budgetBs, budgetUsd }: BudgetSummaryProps) {
  const theme = useAppTheme()
  const styles = stylesheet(theme)

  const isOverBudget = totalBs > budgetBs
  const overBudgetAmount = Math.max(0, totalBs - budgetBs)
  const progressPercentage = Math.min(100, (totalBs / budgetBs) * 100)
  const exchangeRate = budgetBs > 0 ? budgetUsd / budgetBs : 36.42
  const overBudgetUsd = overBudgetAmount * exchangeRate

  return (
    <View style={styles.container as ViewStyle}>
      <View style={styles.limitRow as ViewStyle}>
        <Text style={styles.limitLabel as TextStyle}>
          LÍMITE: Bs. {budgetBs.toLocaleString('es-VE', { minimumFractionDigits: 2 })}
        </Text>
        <Text style={styles.limitUsd as TextStyle}>
          ($ {budgetUsd.toLocaleString('es-VE', { minimumFractionDigits: 2 })})
        </Text>
      </View>

      <View style={styles.totalRow as ViewStyle}>
        <View style={styles.totalLeft as ViewStyle}>
          <Text style={styles.totalLabel as TextStyle}>TOTAL GASTADO</Text>
          <View style={styles.totalAmountRow as ViewStyle}>
            <Text style={styles.totalBs as TextStyle}>
              Bs. {totalBs.toLocaleString('es-VE', { minimumFractionDigits: 2 })}
            </Text>
            <Text style={styles.totalUsd as TextStyle}>
              ($ {totalUsd.toLocaleString('es-VE', { minimumFractionDigits: 2 })})
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.progressBarContainer as ViewStyle}>
        <ProgressBar
          progress={progressPercentage}
          color={isOverBudget ? theme.colors.error : theme.colors.midnight}
          backgroundColor={theme.colors.surfaceContainer}
          height={12}
        />
      </View>

      {isOverBudget && (
        <View style={styles.warningContainer as ViewStyle}>
          <MaterialIcons name="warning" size={16} color={theme.colors.error} />
          <Text style={styles.warningText as TextStyle}>
            Excedido por Bs.{' '}
            {overBudgetAmount.toLocaleString('es-VE', { minimumFractionDigits: 2 })} / $
            {overBudgetUsd.toLocaleString('es-VE', { minimumFractionDigits: 2 })}
          </Text>
        </View>
      )}
    </View>
  )
}
