import { View, Text, ViewStyle, TextStyle } from 'react-native';
import { StyleSheet } from '../../styles/createStyleSheet';
import { useAppTheme } from '../../styles/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface StatusBadgeProps {
  status: 'Completado' | 'Activo' | string;
  iconOnly?: boolean;
}

const stylesheet = StyleSheet.create(theme => ({
  badge: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  iconBadge: {
    padding: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  text: {
    fontSize: theme.typography.fontSize.xxs,
    fontWeight: theme.typography.fontWeight.semibold,
    textTransform: 'uppercase',
  },
}));

export function StatusBadge({ status, iconOnly }: StatusBadgeProps) {
  const theme = useAppTheme();
  const styles = stylesheet(theme);

  const getStatusColors = () => {
    switch (status) {
      case 'Completado':
        return {
          backgroundColor: theme.colors.meadowGreen + '20',
          textColor: theme.colors.meadowGreen,
          iconName: 'check-circle' as const,
        };
      case 'Activo':
        return {
          backgroundColor: theme.colors.warning + '20',
          textColor: theme.colors.warning,
          iconName: 'progress-alert' as const,
        };
      default:
        return {
          backgroundColor: theme.colors.surfaceContainer,
          textColor: theme.colors.onSurface,
          iconName: 'help-circle' as const,
        };
    }
  };

  const colors = getStatusColors();

  if (iconOnly) {
    return (
      <View style={[styles.iconBadge as ViewStyle, { backgroundColor: colors.backgroundColor }]}>
        <MaterialCommunityIcons name={colors.iconName} size={20} color={colors.textColor} />
      </View>
    );
  }

  return (
    <View style={[styles.badge as ViewStyle, { backgroundColor: colors.backgroundColor }]}>
      <Text style={[styles.text as TextStyle, { color: colors.textColor }]}>{status}</Text>
    </View>
  );
}
