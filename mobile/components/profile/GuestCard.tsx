import { View, Text, Pressable, type ViewStyle, type TextStyle } from 'react-native'
import { StyleSheet } from '../../styles/createStyleSheet'
import { useAppTheme } from '../../styles/theme'
import { MaterialIcons } from '@expo/vector-icons'

interface GuestCardProps {
  onCreateAccountPress?: () => void
}

const stylesheet = StyleSheet.create(theme => ({
  card: {
    backgroundColor: theme.colors.surfaceContainerHigh,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xl,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: theme.colors.outlineVariant,
    alignItems: 'center',
    gap: theme.spacing.md,
    marginVertical: theme.spacing.lg,
  },
  icon: {
    width: 48,
    height: 48,
    borderRadius: 9999,
    backgroundColor: theme.colors.surfaceContainerLowest,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.onSurface,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.onSurfaceVariant,
    textAlign: 'center',
  },
  button: {
    marginTop: theme.spacing.xs,
  },
  buttonText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary,
  },
}))

export function GuestCard({ onCreateAccountPress }: GuestCardProps) {
  const theme = useAppTheme()
  const styles = stylesheet(theme)

  return (
    <View style={styles.card as ViewStyle}>
      <View style={styles.icon as ViewStyle}>
        <MaterialIcons name="person-add" size={24} color={theme.colors.primary} />
      </View>
      <View>
        <Text style={styles.title as TextStyle}>¡Únete a MercadoLibreta!</Text>
        <Text style={styles.subtitle as TextStyle}>
          Regístrate para guardar tu historial y más.
        </Text>
      </View>
      <Pressable style={styles.button as ViewStyle} onPress={onCreateAccountPress}>
        <Text style={styles.buttonText as TextStyle}>Crear cuenta ahora</Text>
      </Pressable>
    </View>
  )
}
