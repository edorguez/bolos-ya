import { View, Text } from 'react-native'
import { StyleSheet } from '../../styles/createStyleSheet'
import { useAppTheme } from '../../styles/theme'

interface AmountCardProps {
  label: string
  value: string
  exceeded?: boolean
  variant?: 'bs' | 'usd'
}

const stylesheet = StyleSheet.create(theme => ({
  card: {
    flex: 1,
    backgroundColor: theme.colors.surfaceContainerLow,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
  },
  label: {
    fontSize: 10,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.outline,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: theme.spacing.xs,
  },
  value: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
  },
}))

export function AmountCard({ label, value, exceeded, variant = 'bs' }: AmountCardProps) {
  const theme = useAppTheme()

  const getValueColor = () => {
    if (exceeded) return theme.colors.error
    if (variant === 'usd') return theme.colors.primary
    return theme.colors.onSurface
  }

  return (
    <View
      style={[
        stylesheet.card,
        exceeded && { borderWidth: 1, borderColor: theme.colors.error + '10' },
      ]}
    >
      <Text style={stylesheet.label}>{label}</Text>
      <Text style={[stylesheet.value, { color: getValueColor() }]}>{value}</Text>
    </View>
  )
}
