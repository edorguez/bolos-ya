import { View, Text, StyleSheet } from 'react-native'
import { useAppTheme } from '../styles/theme'

export default function NotFoundScreen() {
  const theme = useAppTheme()

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.md,
    },
    textHeading: {
      fontSize: theme.typography.fontSize.xl,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.text,
    },
    textBody: {
      fontSize: theme.typography.fontSize.md,
      fontWeight: theme.typography.fontWeight.regular,
      color: theme.colors.text,
    },
  })

  return (
    <View style={styles.container}>
      <Text style={styles.textHeading}>404 - Not Found</Text>
      {/* eslint-disable-next-line react/no-unescaped-entities */}
      <Text style={styles.textBody}>The screen you're looking for doesn't exist.</Text>
    </View>
  )
}
