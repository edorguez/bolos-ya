import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAppTheme } from '../../styles/theme';
import { signUp } from '../../lib/auth-client';
import { Toast } from '../../components/shared/Toast';
import { MaterialIcons } from '@expo/vector-icons';

export default function RegisterScreen() {
  const router = useRouter();
  const theme = useAppTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const handleRegister = async () => {
    setToast(null);
    if (!email.trim()) {
      setToast('Ingresa tu correo electrónico');
      return;
    }
    if (!password) {
      setToast('Ingresa una contraseña');
      return;
    }
    if (password.length < 8) {
      setToast('La contraseña debe tener al menos 8 caracteres');
      return;
    }
    if (password !== confirmPassword) {
      setToast('Las contraseñas no coinciden');
      return;
    }

    setIsLoading(true);
    try {
      const result = await signUp.email({
        email: email.trim(),
        password,
        name: email.trim().split('@')[0],
      });
      if (result.error) {
        setToast('Error al crear la cuenta');
        return;
      }
      router.replace('/(tabs)');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al crear la cuenta';
      setToast(message);
    } finally {
      setIsLoading(false);
    }
  };

  const styles = StyleSheet.create({
    backButton: {
      padding: theme.spacing.md,
    },
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scroll: {
      flexGrow: 1,
      paddingTop: theme.spacing.xxl,
    },
    content: {
      paddingHorizontal: theme.spacing.lg,
      width: '100%',
      maxWidth: 400,
      alignSelf: 'center',
      gap: theme.spacing.lg,
    },
    header: {
      alignItems: 'center',
      gap: theme.spacing.sm,
      marginBottom: theme.spacing.md,
    },
    title: {
      fontSize: theme.typography.fontSize.xl,
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.text,
      letterSpacing: theme.typography.letterSpacing.xl,
    },
    subtitle: {
      fontSize: theme.typography.fontSize.md,
      color: theme.colors.textSecondary,
      textAlign: 'center',
    },
    form: {
      gap: theme.spacing.md,
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surfaceContainerLow,
      borderRadius: theme.borderRadius.md,
      paddingHorizontal: theme.spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.stoneSurface,
    },
    input: {
      flex: 1,
      paddingVertical: theme.spacing.md,
      fontSize: theme.typography.fontSize.md,
      color: theme.colors.text,
    },
    inputIcon: {
      marginRight: theme.spacing.sm,
    },
    togglePassword: {
      padding: theme.spacing.xs,
    },
    registerButton: {
      backgroundColor: theme.colors.midnight,
      borderRadius: theme.borderRadius.button,
      paddingVertical: theme.spacing.md,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      gap: theme.spacing.sm,
    },
    registerButtonText: {
      color: '#FFFFFF',
      fontSize: theme.typography.fontSize.md,
      fontWeight: theme.typography.fontWeight.semibold,
    },
    footer: {
      alignItems: 'center',
      paddingVertical: theme.spacing.lg,
    },
    footerText: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.textSecondary,
    },
    link: {
      color: theme.colors.emberOrange,
      fontWeight: theme.typography.fontWeight.semibold,
    },
  });

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={{ position: 'absolute', top: 0, left: 0, zIndex: 10 }}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={theme.colors.text} />
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="always">
        <View style={styles.content}>
          <View style={styles.header}>
            <MaterialIcons name="person-add" size={48} color={theme.colors.midnight} />
            <Text style={styles.title}>Crear Cuenta</Text>
            <Text style={styles.subtitle}>Regístrate para guardar tu historial y más</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <MaterialIcons
                name="mail-outline"
                size={20}
                color={theme.colors.textSecondary}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Correo electrónico"
                placeholderTextColor={theme.colors.textSecondary}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
                editable={!isLoading}
              />
            </View>

            <View style={styles.inputContainer}>
              <MaterialIcons
                name="lock-outline"
                size={20}
                color={theme.colors.textSecondary}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Contraseña (mín. 8 caracteres)"
                placeholderTextColor={theme.colors.textSecondary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                editable={!isLoading}
                maxLength={20}
              />
              <Pressable
                style={styles.togglePassword}
                onPress={() => setShowPassword(!showPassword)}
              >
                <MaterialIcons
                  name={showPassword ? 'visibility-off' : 'visibility'}
                  size={20}
                  color={theme.colors.textSecondary}
                />
              </Pressable>
            </View>

            <View style={styles.inputContainer}>
              <MaterialIcons
                name="lock-outline"
                size={20}
                color={theme.colors.textSecondary}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Confirmar contraseña"
                placeholderTextColor={theme.colors.textSecondary}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirm}
                autoCapitalize="none"
                editable={!isLoading}
              />
              <Pressable style={styles.togglePassword} onPress={() => setShowConfirm(!showConfirm)}>
                <MaterialIcons
                  name={showConfirm ? 'visibility-off' : 'visibility'}
                  size={20}
                  color={theme.colors.textSecondary}
                />
              </Pressable>
            </View>

            <Pressable
              onPress={handleRegister}
              disabled={isLoading}
              style={({ pressed }) => [
                styles.registerButton,
                pressed && { opacity: 0.8 },
                isLoading && { opacity: 0.6 },
              ]}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <MaterialIcons name="person-add" size={20} color="#FFFFFF" />
                  <Text style={styles.registerButtonText}>Crear Cuenta</Text>
                </>
              )}
            </Pressable>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              ¿Ya tienes cuenta?{' '}
              <Text style={styles.link} onPress={() => router.push('/(onboarding)/login')}>
                Inicia sesión
              </Text>
            </Text>
          </View>
        </View>
      </ScrollView>
      <Toast message={toast} onDismiss={() => setToast(null)} position="bottom" />
    </View>
  );
}
