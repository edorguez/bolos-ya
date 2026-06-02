import { View, Text, ActivityIndicator, type ViewStyle, type TextStyle } from 'react-native';
import { StyleSheet } from '../../styles/createStyleSheet';
import { useAppTheme } from '../../styles/theme';
import { useBCV } from '../../store/bcvStore';
import { formatBs } from '../../utils/currency';
import { formatDate } from '../../utils/dateUtils';

const stylesheet = StyleSheet.create(theme => ({
  card: {
    backgroundColor: theme.colors.surfaceContainerLow,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.stoneSurface,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.meadowGreen,
    gap: theme.spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  indicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.meadowGreen,
  },
  headerLabel: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  rateRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: theme.spacing.xs,
  },
  rateValue: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.midnight,
    letterSpacing: theme.typography.letterSpacing.xl,
  },
  rateLabel: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.regular,
    color: theme.colors.graphite,
  },
  eurRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: theme.spacing.xs,
  },
  eurValue: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.ash,
  },
  eurLabel: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.regular,
    color: theme.colors.smoke,
  },
  dateText: {
    fontSize: theme.typography.fontSize.xxs,
    fontWeight: theme.typography.fontWeight.regular,
    color: theme.colors.smoke,
    textAlign: 'right',
    marginTop: theme.spacing.xxs,
  },
  loadingContainer: {
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.stoneSurface,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
  },
}));

export function BCVRateCard() {
  const theme = useAppTheme();
  const styles = stylesheet(theme);
  const { rate, isLoading } = useBCV();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer as ViewStyle}>
        <ActivityIndicator size="small" color={theme.colors.ash} />
      </View>
    );
  }

  if (!rate) return null;

  return (
    <View style={styles.card as ViewStyle}>
      <View style={styles.header as ViewStyle}>
        <View style={styles.indicator as ViewStyle} />
        <Text style={styles.headerLabel as TextStyle}>Tasa BCV</Text>
      </View>

      <View style={styles.rateRow as ViewStyle}>
        <Text style={styles.rateLabel as TextStyle}>1 USD</Text>
        <Text style={styles.rateLabel as TextStyle}>{'\u2248'}</Text>
        <Text style={styles.rateValue as TextStyle}>
          Bs. {formatBs(rate.usdRate).replace('Bs ', '')}
        </Text>
      </View>

      <View style={styles.eurRow as ViewStyle}>
        <Text style={styles.eurLabel as TextStyle}>1 EUR</Text>
        <Text style={styles.eurLabel as TextStyle}>{'\u2248'}</Text>
        <Text style={styles.eurValue as TextStyle}>
          Bs. {rate.eurRate.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </Text>
      </View>

      {rate.rateDate && (
        <Text style={styles.dateText as TextStyle}>{formatDate(rate.rateDate)}</Text>
      )}
    </View>
  );
}
