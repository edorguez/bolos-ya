import { View, Text, type ViewStyle, type TextStyle } from 'react-native'
import { StyleSheet } from '../../styles/createStyleSheet'
import { useAppTheme } from '../../styles/theme'
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
    padding: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.lg,
    overflow: 'hidden',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: theme.typography.fontSize.sm,
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
  const theme = useAppTheme()
  const styles = stylesheet(theme)
  return (
    <View style={styles.container as ViewStyle}>
      <View style={styles.textContainer as ViewStyle}>
        <Text style={styles.title as TextStyle}>{title}</Text>
        <Text style={styles.subtitle as TextStyle}>{subtitle}</Text>
      </View>
      <View style={styles.iconContainer as ViewStyle}>
        <MaterialIcons name={icon as any} size={64} color={theme.colors.primary} />
      </View>
    </View>
  )
}
