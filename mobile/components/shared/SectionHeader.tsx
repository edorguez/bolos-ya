import { View, Text, Pressable, PressableProps, type ViewStyle, type TextStyle } from 'react-native'
import { StyleSheet } from '../../styles/createStyleSheet'
import { useAppTheme } from '../../styles/theme'
// @ts-ignore
import MaterialIcons from '@expo/vector-icons/build/MaterialIcons'

interface SectionHeaderProps {
  title: string
  linkText?: string
  onLinkPress?: () => void
  icon?: string
  iconColor?: string
}

const stylesheet = StyleSheet.create(theme => ({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  title: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.onSurface,
  },
  link: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary,
  },
  icon: {
    marginRight: theme.spacing.sm,
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
}))

export function SectionHeader({
  title,
  linkText,
  onLinkPress,
  icon,
  iconColor,
}: SectionHeaderProps) {
  const theme = useAppTheme()
  const styles = stylesheet(theme)
  return (
    <View style={styles.container as ViewStyle}>
      <View style={styles.leftContainer as ViewStyle}>
        {icon && (
          <MaterialIcons
            name={icon as any}
            size={24}
            color={iconColor || theme.colors.onSurface}
            style={styles.icon as TextStyle}
          />
        )}
        <Text style={styles.title as TextStyle}>{title}</Text>
      </View>
      {linkText && onLinkPress && (
        <Pressable onPress={onLinkPress}>
          <Text style={styles.link as TextStyle}>{linkText}</Text>
        </Pressable>
      )}
    </View>
  )
}
