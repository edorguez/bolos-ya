import { View, Text, Pressable, type ViewStyle, type TextStyle } from 'react-native'
import { StyleSheet } from '../../styles/createStyleSheet'
import { useAppTheme } from '../../styles/theme'
import { MaterialIcons } from '@expo/vector-icons'

interface SectionHeaderProps {
  title: string
  linkText?: string
  onLinkPress?: () => void
  icon?: string
  iconColor?: string
  iconPosition?: 'left' | 'right'
}

const stylesheet = StyleSheet.create(theme => ({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  title: {
    fontSize: theme.typography.fontSize.xl,
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
  iconRight: {
    marginLeft: theme.spacing.sm,
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rightContainer: {
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
  iconPosition = 'left',
}: SectionHeaderProps) {
  const theme = useAppTheme()
  const styles = stylesheet(theme)

  const leftIcon = icon && iconPosition === 'left'
  const rightIcon = icon && iconPosition === 'right'

  return (
    <View style={styles.container as ViewStyle}>
      <View style={styles.leftContainer as ViewStyle}>
        {leftIcon && (
          <MaterialIcons
            name={icon as any}
            size={24}
            color={iconColor || theme.colors.onSurface}
            style={styles.icon as TextStyle}
          />
        )}
        <Text style={styles.title as TextStyle}>{title}</Text>
      </View>

      <View style={styles.rightContainer as ViewStyle}>
        {rightIcon && (
          <MaterialIcons
            name={icon as any}
            size={24}
            color={iconColor || theme.colors.onSurface}
            style={styles.iconRight as TextStyle}
          />
        )}
        {linkText && onLinkPress && (
          <Pressable onPress={onLinkPress} style={({ pressed }) => pressed && { opacity: 0.8 }}>
            <Text style={styles.link as TextStyle}>{linkText}</Text>
          </Pressable>
        )}
      </View>
    </View>
  )
}
