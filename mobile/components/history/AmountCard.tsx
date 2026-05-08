import { View, Text, ViewStyle, TextStyle } from 'react-native';
import { StyleSheet } from '../../styles/createStyleSheet';
import { useAppTheme } from '../../styles/theme';

interface AmountCardProps {
  label: string;
  value: string;
}

const stylesheet = StyleSheet.create(theme => ({
  card: {
    flex: 1,
    backgroundColor: theme.colors.parchmentCard,
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.sm,
  },
  label: {
    fontSize: theme.typography.fontSize.xxs,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.ash,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: theme.spacing.xs,
  },
  value: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.graphite,
  },
}));

export function AmountCard({ label, value }: AmountCardProps) {
  const theme = useAppTheme();
  const styles = stylesheet(theme);

  return (
    <View style={styles.card as ViewStyle}>
      <Text style={styles.label as TextStyle}>{label}</Text>
      <Text style={styles.value as TextStyle}>{value}</Text>
    </View>
  );
}
