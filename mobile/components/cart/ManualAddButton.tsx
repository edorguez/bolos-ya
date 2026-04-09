import { View, Text, Pressable, PressableProps, type ViewStyle, type TextStyle } from 'react-native'
import { StyleSheet } from '../../styles/createStyleSheet'
import { useAppTheme } from '../../styles/theme'
// @ts-ignore
import MaterialIcons from '@expo/vector-icons/build/MaterialIcons'

interface ManualAddButtonProps extends PressableProps {
  title?: string
}

const stylesheet = StyleSheet.create(theme => ({
  button: {
    width: '100%',
    padding: 24,
    backgroundColor: theme.colors.surfaceContainerLow,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.onSurface,
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
      <View style={styles.leftContainer as ViewStyle}>
        <View style={styles.iconContainer as ViewStyle}>
          <MaterialIcons name="add" size={24} color="#FFFFFF" />
        </View>
        <Text style={styles.text as TextStyle}>{title}</Text>
      </View>
      <MaterialIcons name="chevron_right" size={24} color={theme.colors.outline} />
    </Pressable>
  )
}
