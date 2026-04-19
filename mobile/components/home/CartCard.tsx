import { View, Text, type ViewStyle, type TextStyle } from 'react-native'
import { StyleSheet } from '../../styles/createStyleSheet'
import { useAppTheme } from '../../styles/theme'
import { ProgressBar } from '../shared/ProgressBar'
import { MaterialIcons } from '@expo/vector-icons'

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
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
    borderWidth: 1,
    borderColor: '#0000000d',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  date: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.onSurfaceVariant,
    backgroundColor: '#ffffff',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: '#0000000d',
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
  const theme = useAppTheme()
  const styles = stylesheet(theme)
  return (
    <View style={styles.card as ViewStyle}>
      <View style={styles.header as ViewStyle}>
        <View style={[styles.iconContainer as ViewStyle, { backgroundColor: color + '20' }]}>
          <MaterialIcons name={icon as any} size={24} color={color} />
        </View>
        <Text style={styles.date as TextStyle}>{date}</Text>
      </View>
      <View>
        <Text style={styles.title as TextStyle}>{title}</Text>
        <Text style={styles.subtitle as TextStyle}>{subtitle}</Text>
      </View>
      <ProgressBar progress={progress} color={color} height={10} />
    </View>
  )
}
