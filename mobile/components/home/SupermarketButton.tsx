import { Pressable, Text, type ViewStyle, type TextStyle } from 'react-native'
import { StyleSheet } from '../../styles/createStyleSheet'
import { useAppTheme } from '../../styles/theme'
import { MaterialIcons } from '@expo/vector-icons'

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
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
    gap: theme.spacing.xs,
    borderWidth: 0,
    borderColor: 'transparent',
  },
  buttonSelected: {
    borderWidth: 2,
    borderColor: theme.colors.midnight,
  },
  label: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.semibold,
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
        color={selected ? theme.colors.midnight : theme.colors.outline}
      />
      <Text style={[styles.label as TextStyle, selected && (styles.labelSelected as TextStyle)]}>
        {name}
      </Text>
    </Pressable>
  )
}
