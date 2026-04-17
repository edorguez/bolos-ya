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
    borderRadius: 24,
    padding: 16,
    shadowColor: theme.colors.onSurface,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    borderWidth: 1,
    borderColor: `${theme.colors.surfaceContainerLow}80`,
    marginBottom: 16,
  },
  limitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  limitLabel: {
    fontSize: theme.typography.fontSize.xxs,
    fontWeight: theme.typography.fontWeight.bold,
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: theme.colors.onSurfaceVariant,
  },
  limitUsd: {
    fontSize: theme.typography.fontSize.xxs,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.onSurfaceVariant,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  totalLeft: {
    flex: 1,
  },
  totalLabel: {
    fontSize: theme.typography.fontSize.xxs,
    fontWeight: theme.typography.fontWeight.bold,
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: theme.colors.onSurfaceVariant,
    marginBottom: 4,
  },
  totalAmountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  totalBs: {
    fontSize: 28,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.onSurface,
  },
  totalUsd: {
    fontSize: 14,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.onSurfaceVariant,
  },
  progressBarContainer: {
    marginBottom: 12,
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 8,
    backgroundColor: theme.colors.error + '08',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.error + '20',
  },
  warningText: {
    fontSize: 11,
    fontWeight: theme.typography.fontWeight.bold,
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
      {/* Limit row */}
      <View style={styles.limitRow as ViewStyle}>
        <Text style={styles.limitLabel as TextStyle}>
          LÍMITE: Bs. {budgetBs.toLocaleString('es-VE', { minimumFractionDigits: 2 })}
        </Text>
        <Text style={styles.limitUsd as TextStyle}>
          ($ {budgetUsd.toLocaleString('es-VE', { minimumFractionDigits: 2 })})
        </Text>
      </View>

      {/* Total spent row */}
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

      {/* Progress bar */}
      <View style={styles.progressBarContainer as ViewStyle}>
        <ProgressBar
          progress={progressPercentage}
          color={isOverBudget ? theme.colors.error : theme.colors.primary}
          backgroundColor={theme.colors.surfaceContainer}
          height={12}
        />
      </View>

      {/* Warning message */}
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
