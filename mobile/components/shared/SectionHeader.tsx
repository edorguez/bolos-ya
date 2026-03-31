import { View, Text, Pressable, PressableProps } from 'react-native'
import { StyleSheet } from '../../styles/createStyleSheet'
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
  return (
    <View style={stylesheet.container}>
      <View style={stylesheet.leftContainer}>
        {icon && (
          <MaterialIcons
            name={icon as any}
            size={24}
            color={iconColor || stylesheet.title.color}
            style={stylesheet.icon}
          />
        )}
        <Text style={stylesheet.title}>{title}</Text>
      </View>
      {linkText && onLinkPress && (
        <Pressable onPress={onLinkPress}>
          <Text style={stylesheet.link}>{linkText}</Text>
        </Pressable>
      )}
    </View>
  )
}
