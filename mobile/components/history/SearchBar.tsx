import { View, Text, Pressable } from 'react-native'
import { StyleSheet } from '../../styles/createStyleSheet'
// @ts-ignore
import MaterialIcons from '@expo/vector-icons/build/MaterialIcons'

interface SearchBarProps {
  placeholder?: string
  onPress?: () => void
}

const stylesheet = StyleSheet.create(theme => ({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  input: {
    flex: 1,
    backgroundColor: theme.colors.surfaceContainerLow,
    borderRadius: theme.borderRadius.full,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.onSurface,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  placeholder: {
    color: theme.colors.outline,
    fontSize: theme.typography.fontSize.sm,
  },
}))

export function SearchBar({ placeholder = 'Buscar por supermercado...', onPress }: SearchBarProps) {
  return (
    <View style={stylesheet.container}>
      <Pressable style={stylesheet.input} onPress={onPress}>
        <MaterialIcons name="search" size={20} color={stylesheet.placeholder.color} />
        <Text style={stylesheet.placeholder}>{placeholder}</Text>
      </Pressable>
    </View>
  )
}
