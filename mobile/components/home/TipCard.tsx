import { View, Text } from 'react-native'
import { StyleSheet } from '../../styles/createStyleSheet'
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
  return (
    <View style={stylesheet.card}>
      <View style={stylesheet.iconContainer}>
        <MaterialIcons name={icon as any} size={24} color="#795500" />
      </View>
      <View style={stylesheet.content}>
        <Text style={stylesheet.title}>{title}</Text>
        <Text style={stylesheet.text}>{text}</Text>
      </View>
    </View>
  )
}
