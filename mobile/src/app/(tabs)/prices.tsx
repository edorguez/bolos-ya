import { View, Text, StyleSheet } from 'react-native'
import { useAppTheme } from '../../styles/theme'

export default function PricesTab() {
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
      <Text style={styles.textHeading}>Price Database</Text>
      <Text style={styles.textBody}>
        Browse crowdsourced prices and contribute
      </Text>
    </View>
  )
}