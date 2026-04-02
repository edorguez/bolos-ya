import { Pressable, Text, type ViewStyle, type TextStyle } from 'react-native'
import { StyleSheet } from '../../styles/createStyleSheet'
import { useAppTheme } from '../../styles/theme'
// @ts-ignore
import MaterialIcons from '@expo/vector-icons/build/MaterialIcons'

interface SupermarketButtonProps {
  selected: boolean
  icon: string
  name: string
  onPress?: () => void
}

const stylesheet = StyleSheet.create(theme => ({
  button: {
    flex: 1,
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    alignItems: 'center',
    gap: theme.spacing.xs,
    borderWidth: 0,
    borderColor: 'transparent',
  },
  buttonSelected: {
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  label: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.outline,
  },
  labelSelected: {
    color: theme.colors.onSurface,
  },
}))

export function SupermarketButton({ selected, icon, name, onPress }: SupermarketButtonProps) {
  const theme = useAppTheme()
  const styles = stylesheet(theme)
  return (
    <Pressable
      style={[styles.button as ViewStyle, selected && (styles.buttonSelected as ViewStyle)]}
      onPress={onPress}
    >
      <MaterialIcons
        name={icon as any}
        size={24}
        color={selected ? theme.colors.primary : theme.colors.outline}
      />
      <Text style={[styles.label as TextStyle, selected && (styles.labelSelected as TextStyle)]}>
        {name}
      </Text>
    </Pressable>
  )
}
