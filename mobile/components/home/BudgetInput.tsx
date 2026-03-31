import { View, Text, TextInput, TextInputProps } from 'react-native'
import { StyleSheet } from '../../styles/createStyleSheet'

interface BudgetInputProps extends Omit<TextInputProps, 'style'> {
  label: string
  currency?: string
  inputStyle?: TextInputProps['style']
}

const stylesheet = StyleSheet.create(theme => ({
  container: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  label: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.bold,
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: theme.colors.onSurfaceVariant,
  },
  input: {
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.onSurface,
  },
}))

export function BudgetInput({ label, currency, inputStyle, ...props }: BudgetInputProps) {
  return (
    <View style={stylesheet.container}>
      <Text style={stylesheet.label}>{label}</Text>
      <TextInput
        style={[stylesheet.input, inputStyle]}
        placeholder="0.00"
        placeholderTextColor={stylesheet.label.color}
        keyboardType="numeric"
        {...props}
      />
    </View>
  )
}
