import { View, Text } from 'react-native'
import { StyleSheet } from '../../styles/createStyleSheet'
import { useAppTheme } from '../../styles/theme'

interface StatusBadgeProps {
  status: 'Completado' | 'Excedido' | string
}

const stylesheet = StyleSheet.create(theme => ({
  badge: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
  },
  text: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.bold,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
}))

export function StatusBadge({ status }: StatusBadgeProps) {
  const theme = useAppTheme()

  const getStatusColors = () => {
    switch (status) {
      case 'Completado':
        return {
          backgroundColor: theme.colors.secondaryContainer,
          textColor: theme.colors.secondary,
        }
      case 'Excedido':
        return {
          backgroundColor: theme.colors.errorContainer,
          textColor: theme.colors.error,
        }
      default:
        return {
          backgroundColor: theme.colors.surfaceContainer,
          textColor: theme.colors.onSurface,
        }
    }
  }

  const colors = getStatusColors()

  return (
    <View style={[stylesheet.badge, { backgroundColor: colors.backgroundColor }]}>
      <Text style={[stylesheet.text, { color: colors.textColor }]}>{status}</Text>
    </View>
  )
}
