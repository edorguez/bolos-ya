import { Pressable, PressableProps, type ViewStyle } from 'react-native'
import { StyleSheet } from '../../styles/createStyleSheet'
import { useAppTheme } from '../../styles/theme'
// @ts-ignore
import MaterialIcons from '@expo/vector-icons/build/MaterialIcons'

interface ScanFabProps extends PressableProps {
  icon?: string
}

const stylesheet = StyleSheet.create(theme => ({
  fab: {
    position: 'absolute',
    bottom: 120,
    right: 24,
    width: 64,
    height: 64,
    borderRadius: 32,
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

export function ScanFab({ icon = 'photo_camera', ...pressableProps }: ScanFabProps) {
  const theme = useAppTheme()
  const styles = stylesheet(theme)

  return (
    <Pressable style={styles.fab as ViewStyle} {...pressableProps}>
      <MaterialIcons
        name={icon as any}
        size={32}
        color="#FFFFFF"
        style={{ fontVariationSettings: "'FILL' 1" }}
      />
    </Pressable>
  )
}
