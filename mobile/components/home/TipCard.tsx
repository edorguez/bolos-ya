import { View, Text, type ViewStyle, type TextStyle } from 'react-native'
import { StyleSheet } from '../../styles/createStyleSheet'
import { useAppTheme } from '../../styles/theme'
// @ts-ignore
import MaterialIcons from '@expo/vector-icons/build/MaterialIcons'

interface TipCardProps {
  title: string
  text: string
  icon?: string
}

const stylesheet = StyleSheet.create(theme => ({
  card: {
    backgroundColor: theme.colors.tertiaryContainer,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.md,
    overflow: 'hidden',
  },
  iconContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.bold,
    color: '#583d00',
  },
  text: {
    fontSize: theme.typography.fontSize.sm,
    color: '#583d00',
    opacity: 0.8,
  },
}))

export function TipCard({ title, text, icon = 'lightbulb' }: TipCardProps) {
  const theme = useAppTheme()
  const styles = stylesheet(theme)
  return (
    <View style={styles.card as ViewStyle}>
      <View style={styles.iconContainer as ViewStyle}>
        <MaterialIcons name={icon as any} size={24} color="#795500" />
      </View>
      <View style={styles.content as ViewStyle}>
        <Text style={styles.title as TextStyle}>{title}</Text>
        <Text style={styles.text as TextStyle}>{text}</Text>
      </View>
    </View>
  )
}
