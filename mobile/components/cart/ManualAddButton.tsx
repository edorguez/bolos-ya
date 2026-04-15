import { Text, Pressable, PressableProps, type ViewStyle, type TextStyle } from 'react-native'
import { StyleSheet } from '../../styles/createStyleSheet'
import { useAppTheme } from '../../styles/theme'
import { MaterialIcons } from '@expo/vector-icons'

interface ManualAddButtonProps extends PressableProps {
  title?: string
}

const stylesheet = StyleSheet.create(theme => ({
  button: {
    width: '100%',
    padding: 24,
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: `${theme.colors.primary}30`,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  text: {
    fontSize: 14,
    fontWeight: '800',
    color: theme.colors.primary,
    textAlign: 'center',
  },
}))

export function ManualAddButton({
  title = 'Agregar producto manualmente',
  ...pressableProps
}: ManualAddButtonProps) {
  const theme = useAppTheme()
  const styles = stylesheet(theme)

  return (
    <Pressable style={styles.button as ViewStyle} {...pressableProps}>
      <MaterialIcons name="add-circle" size={24} color={theme.colors.primary} />
      <Text style={styles.text as TextStyle}>{title}</Text>
    </Pressable>
  )
}
