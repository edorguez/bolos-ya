import { View, Text, ViewStyle, TextStyle } from 'react-native';
import { StyleSheet } from '../../styles/createStyleSheet';
import { useAppTheme } from '../../styles/theme';

interface StatusBadgeProps {
  status: 'Completado' | 'Excedido' | string;
}

const stylesheet = StyleSheet.create(theme => ({
  badge: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  text: {
    fontSize: theme.typography.fontSize.xxs,
    fontWeight: theme.typography.fontWeight.semibold,
    textTransform: 'uppercase',
  },
}));

export function StatusBadge({ status }: StatusBadgeProps) {
  const theme = useAppTheme();
  const styles = stylesheet(theme);

  const getStatusColors = () => {
    switch (status) {
      case 'Completado':
        return {
          backgroundColor: theme.colors.meadowGreen + '20',
          textColor: theme.colors.meadowGreen,
        };
      case 'Excedido':
        return {
          backgroundColor: theme.colors.coralRed + '20',
          textColor: theme.colors.coralRed,
        };
      default:
        return {
          backgroundColor: theme.colors.surfaceContainer,
          textColor: theme.colors.onSurface,
        };
    }
  };

  const colors = getStatusColors();

  return (
    <View style={[styles.badge as ViewStyle, { backgroundColor: colors.backgroundColor }]}>
      <Text style={[styles.text as TextStyle, { color: colors.textColor }]}>{status}</Text>
    </View>
  );
}
