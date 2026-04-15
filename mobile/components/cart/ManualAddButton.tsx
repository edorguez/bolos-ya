import { Text, Pressable, PressableProps, type ViewStyle, type TextStyle } from 'react-native'
import { StyleSheet } from '../../styles/createStyleSheet'
import { useAppTheme } from '../../styles/theme'
import { MaterialIcons } from '@expo/vector-icons'

interface ManualAddButtonProps extends PressableProps {
  title?: string
}

const stylesheet = StyleSheet.create(theme => ({
  fab: {
    position: 'absolute',
    bottom: 100,
    right: theme.spacing.lg,
    width: 64,
    height: 64,
    borderRadius: 32,
    borderCurve: 'continuous',
    backgroundColor: theme.colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: theme.colors.secondary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 8,
  },
}))

export function ManualAddButton({
  ...pressableProps
}: ManualAddButtonProps) {
  const theme = useAppTheme()
  const styles = stylesheet(theme)

  return (
    <Pressable style={styles.fab as ViewStyle} {...pressableProps}>
      <MaterialIcons name="add" size={32} color="#FFFFFF" />
    </Pressable>
  )
}
