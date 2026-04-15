import { View, Text, Pressable, PressableProps, ViewStyle, TextStyle } from 'react-native'
import { StyleSheet } from '../../styles/createStyleSheet'
import { useAppTheme } from '../../styles/theme'
import { MaterialIcons } from '@expo/vector-icons'

interface SettingItemProps extends Omit<PressableProps, 'style'> {
  title: string
  icon: string
  iconColor: string
  iconBgColor: string
}

const stylesheet = StyleSheet.create(theme => ({
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surfaceContainerLowest,
  },
  itemPressed: {
    backgroundColor: theme.colors.surfaceContainerLow,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.onSurface,
  },
}))

export function SettingItem({ title, icon, iconColor, iconBgColor, ...props }: SettingItemProps) {
  const theme = useAppTheme()
  const styles = stylesheet(theme)

  return (
    <Pressable
      style={({ pressed }) => [
        styles.item as ViewStyle,
        pressed && (styles.itemPressed as ViewStyle),
      ]}
      {...props}
    >
      <View style={styles.left as ViewStyle}>
        <View style={[styles.iconContainer as ViewStyle, { backgroundColor: iconBgColor }]}>
          <MaterialIcons name={icon as any} size={20} color={iconColor} />
        </View>
        <Text style={styles.text as TextStyle}>{title}</Text>
      </View>
      <MaterialIcons name="chevron-right" size={24} color={theme.colors.onSurface} />
    </Pressable>
  )
}
