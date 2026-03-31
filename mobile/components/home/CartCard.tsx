import { View, Text } from 'react-native'
import { StyleSheet } from '../../styles/createStyleSheet'
// @ts-ignore
import MaterialIcons from '@expo/vector-icons/build/MaterialIcons'
import { ProgressBar } from '../shared/ProgressBar'

interface CartCardProps {
  title: string
  subtitle: string
  date: string
  progress: number
  color: string
  icon: string
}

const stylesheet = StyleSheet.create(theme => ({
  card: {
    minWidth: 280,
    backgroundColor: theme.colors.surfaceContainerLow,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 48,
    height: 48,
    backgroundColor: theme.colors.secondary + '20',
    borderRadius: theme.borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  date: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.outline,
  },
  title: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.onSurface,
  },
  subtitle: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.onSurfaceVariant,
  },
}))

export function CartCard({ title, subtitle, date, progress, color, icon }: CartCardProps) {
  return (
    <View style={stylesheet.card}>
      <View style={stylesheet.header}>
        <View style={[stylesheet.iconContainer, { backgroundColor: color + '20' }]}>
          <MaterialIcons name={icon as any} size={24} color={color} />
        </View>
        <Text style={stylesheet.date}>{date}</Text>
      </View>
      <View>
        <Text style={stylesheet.title}>{title}</Text>
        <Text style={stylesheet.subtitle}>{subtitle}</Text>
      </View>
      <ProgressBar progress={progress} color={color} />
    </View>
  )
}
