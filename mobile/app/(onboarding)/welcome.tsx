import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native'
import { useRouter } from 'expo-router'
import { useAppTheme } from '../../styles/theme'
import { MaterialIcons } from '@expo/vector-icons'

const { width } = Dimensions.get('window')

export default function WelcomeScreen() {
  const router = useRouter()
  const theme = useAppTheme()

  const handleNext = () => {
    router.push('/(onboarding)/login-choice')
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    skipButton: {
      padding: theme.spacing.sm,
    },
    skipText: {
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.textSecondary,
      letterSpacing: 0.5,
    },
    main: {
      flex: 1,
      paddingHorizontal: theme.spacing.lg,
      justifyContent: 'flex-start',
      paddingTop: theme.spacing.xl,
    },
    illustrationContainer: {
      width: '100%',
      aspectRatio: 1,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: theme.spacing.xxl,
      position: 'relative',
    },
    blobBackground: {
      position: 'absolute',
      width: '95%',
      height: '95%',
      backgroundColor: '#f8eae8',
      borderRadius: theme.borderRadius.xl,
      transform: [{ rotate: '3deg' }],
      opacity: 0.5,
    },
    illustration: {
      width: '100%',
      height: '100%',
      backgroundColor: '#f8eae8',
      borderRadius: theme.borderRadius.xl,
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    },
    circle: {
      width: width * 0.4,
      height: width * 0.4,
      backgroundColor: 'rgba(255, 255, 255, 0.4)',
      borderRadius: width * 0.2,
      alignItems: 'center',
      justifyContent: 'center',
    },
    cartIcon: {
      color: theme.colors.primary,
    },
    priceBubble1: {
      position: 'absolute',
      top: 100,
      right: width - 380,
      backgroundColor: theme.colors.secondary,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.borderRadius.full,
      transform: [{ rotate: '12deg' }],
    },
    priceBubble2: {
      position: 'absolute',
      top: '50%',
      left: width * 0.001,
      backgroundColor: theme.colors.tertiaryContainer,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.borderRadius.full,
      transform: [{ rotate: '-12deg' }],
    },
    priceTextBuble1: {
      color: '#FFFFFF',
      fontWeight: theme.typography.fontWeight.bold,
      fontSize: theme.typography.fontSize.sm,
    },
    priceTextBuble2: {
      color: theme.colors.onSurface,
      fontWeight: theme.typography.fontWeight.bold,
      fontSize: theme.typography.fontSize.sm,
    },
    content: {
      gap: theme.spacing.md,
    },
    title: {
      fontSize: theme.typography.fontSize.xl,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.secondary,
      lineHeight: 36,
      letterSpacing: -0.5,
    },
    description: {
      fontSize: theme.typography.fontSize.md,
      lineHeight: 24,
      color: theme.colors.textSecondary,
    },
    boldText: {
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.text,
    },
    footer: {
      padding: theme.spacing.lg,
      gap: theme.spacing.xl,
    },
    nextButton: {
      backgroundColor: theme.colors.primary,
      borderRadius: theme.borderRadius.full,
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: theme.spacing.sm,
      shadowColor: theme.colors.primary,
      shadowOffset: { width: 0, height: 20 },
      shadowOpacity: 0.2,
      shadowRadius: 40,
      elevation: 8,
    },
    nextButtonText: {
      color: '#FFFFFF',
      fontSize: theme.typography.fontSize.md,
      fontWeight: theme.typography.fontWeight.bold,
    },
  })

  return (
    <View style={styles.container}>
      <View style={styles.main}>
        <View style={styles.illustrationContainer}>
          <View style={styles.blobBackground} />
          <View style={styles.illustration}>
            <View style={styles.circle}>
              <MaterialIcons name="shopping-cart" size={96} color={theme.colors.primary} />
            </View>
            <View style={styles.priceBubble1}>
              <Text style={styles.priceTextBuble1}>$ 12.50</Text>
            </View>
            <View style={styles.priceBubble2}>
              <Text style={styles.priceTextBuble2}>Bs. 450</Text>
            </View>
          </View>
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>Calcula sobre la marcha</Text>
          <Text style={styles.description}>
            Olvídate del miedo en la cola del mercado. Registra tus productos en tiempo real y mira
            el total exacto tanto en <Text style={styles.boldText}>Bolívares</Text> como en{' '}
            <Text style={styles.boldText}>Dólares</Text>.
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Pressable
          onPress={handleNext}
          style={({ pressed }) => [styles.nextButton, pressed && { opacity: 0.8 }]}
        >
          <Text style={styles.nextButtonText}>Siguiente</Text>
          <MaterialIcons name="arrow-forward" size={24} color="#FFFFFF" />
        </Pressable>
      </View>
    </View>
  )
}
