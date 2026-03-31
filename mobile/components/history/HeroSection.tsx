import { View, Text } from 'react-native'
import { StyleSheet } from '../../styles/createStyleSheet'
// @ts-ignore
import MaterialIcons from '@expo/vector-icons/build/MaterialIcons'

interface HeroSectionProps {
  title: string
  subtitle: string
  icon?: string
}

const stylesheet = StyleSheet.create(theme => ({
  container: {
    borderRadius: theme.borderRadius.xl,
    backgroundColor: theme.colors.primaryContainer + '20',
    padding: theme.spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.lg,
    overflow: 'hidden',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: theme.typography.fontSize.xxl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.onSurfaceVariant,
    lineHeight: 24,
  },
  iconContainer: {
    width: 128,
    height: 128,
    justifyContent: 'center',
    alignItems: 'center',
  },
}))

export function HeroSection({ title, subtitle, icon = 'receipt' }: HeroSectionProps) {
  return (
    <View style={stylesheet.container}>
      <View style={stylesheet.textContainer}>
        <Text style={stylesheet.title}>{title}</Text>
        <Text style={stylesheet.subtitle}>{subtitle}</Text>
      </View>
      <View style={stylesheet.iconContainer}>
        <MaterialIcons name={icon as any} size={64} color={stylesheet.title.color} />
      </View>
    </View>
  )
}
