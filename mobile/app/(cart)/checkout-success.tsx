import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppTheme } from '../../styles/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function CheckoutSuccessScreen() {
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
      backgroundColor: theme.colors.meadowGreen + '20',
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
      color: theme.colors.white,
      fontSize: theme.typography.fontSize.md,
      fontWeight: theme.typography.fontWeight.semibold,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <MaterialCommunityIcons name="check-circle" size={64} color={theme.colors.meadowGreen} />
      </View>
      <Text style={styles.title}>Tu carrito fue completado con éxito</Text>
      <Text style={styles.subtitle}>Todo listo para tu próxima visita al supermercado</Text>
      <Pressable
        style={({ pressed }) => [styles.button, pressed && { opacity: 0.8 }]}
        onPress={() => router.replace('/(tabs)')}
      >
        <Text style={styles.buttonText}>Ir al Inicio</Text>
      </Pressable>
    </View>
  );
}
