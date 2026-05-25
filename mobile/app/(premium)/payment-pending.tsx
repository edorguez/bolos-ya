import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppTheme } from '../../styles/theme';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function PaymentPendingScreen() {
  const router = useRouter();
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.lg,
      paddingBottom: insets.bottom,
    },
    iconContainer: {
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: theme.colors.sunburstYellow + '25',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: theme.spacing.xl,
    },
    title: {
      fontSize: theme.typography.fontSize.xl,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.onSurface,
      textAlign: 'center',
      marginBottom: theme.spacing.sm,
    },
    subtitle: {
      fontSize: theme.typography.fontSize.md,
      color: theme.colors.onSurfaceVariant,
      textAlign: 'center',
      marginBottom: theme.spacing.xxl,
      lineHeight: 22,
      paddingHorizontal: theme.spacing.md,
    },
    button: {
      backgroundColor: theme.colors.midnight,
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.xxl,
      borderRadius: theme.borderRadius.button,
      width: '100%',
      maxWidth: 300,
      alignItems: 'center',
    },
    buttonText: {
      color: '#FFFFFF',
      fontSize: theme.typography.fontSize.md,
      fontWeight: theme.typography.fontWeight.semibold,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <MaterialIcons name="hourglass-empty" size={64} color={theme.colors.sunburstYellow} />
      </View>
      <Text style={styles.title}>Pago en revisión</Text>
      <Text style={styles.subtitle}>
        Tienes un pago pendiente de confirmación. Nuestro equipo revisará tu pago y activará tu
        membresía. Mientras tanto, puedes seguir disfrutando de la app.
      </Text>
      <Pressable
        style={({ pressed }) => [styles.button, pressed && { opacity: 0.8 }]}
        onPress={() => router.replace('/(tabs)')}
      >
        <Text style={styles.buttonText}>Ir al Inicio</Text>
      </Pressable>
    </View>
  );
}
