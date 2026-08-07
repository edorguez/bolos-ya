import { useState } from 'react';
import { View, Text, Pressable, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppTheme } from '../../styles/theme';
import { createButtonStyles } from '../../styles/buttons';
import { Input } from '../../components/shared/Input';
import { signIn } from '../../lib/auth-client';
import { Toast } from '../../components/shared/Toast';
import { MaterialIcons } from '@expo/vector-icons';

export default function LoginScreen() {
  const router = useRouter();
  const theme = useAppTheme();
  const buttonStyles = createButtonStyles(theme);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const handleLogin = async () => {
    setToast(null);
    if (!email.trim()) {
      setToast('Ingresa tu correo electrónico');
      return;
    }
    if (!password) {
      setToast('Ingresa tu contraseña');
      return;
    }

    setIsLoading(true);
    try {
      const result = await signIn.email({
        email: email.trim(),
        password,
      });
      if (result.error) {
        setToast('Correo o contraseña incorrectos');
        return;
      }
      router.replace('/(tabs)');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al iniciar sesión';
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
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.textSecondary,
      textAlign: 'center',
    },
    form: {
      gap: theme.spacing.md,
    },
    loginButton: {
      ...buttonStyles.base,
      backgroundColor: theme.colors.midnight,
      paddingVertical: theme.spacing.md,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      gap: theme.spacing.sm,
    },
    loginButtonText: {
      color: theme.colors.white,
      fontSize: theme.typography.fontSize.sm,
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
            <MaterialIcons name="lock" size={48} color={theme.colors.midnight} />
            <Text style={styles.title}>Iniciar Sesión</Text>
            <Text style={styles.subtitle}>Ingresa tus credenciales para continuar</Text>
          </View>

          <View style={styles.form}>
            <Input
              leadingIcon={
                <MaterialIcons name="mail-outline" size={20} color={theme.colors.textSecondary} />
              }
              placeholder="Correo electrónico"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
              editable={!isLoading}
            />

            <Input
              leadingIcon={
                <MaterialIcons name="lock-outline" size={20} color={theme.colors.textSecondary} />
              }
              trailingAction={
                <Pressable
                  onPress={() => setShowPassword(!showPassword)}
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  <MaterialIcons
                    name={showPassword ? 'visibility-off' : 'visibility'}
                    size={20}
                    color={theme.colors.textSecondary}
                  />
                </Pressable>
              }
              placeholder="Contraseña"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              editable={!isLoading}
              maxLength={20}
            />

            <Pressable
              onPress={handleLogin}
              disabled={isLoading}
              style={({ pressed }) => [
                styles.loginButton,
                pressed && buttonStyles.pressed,
                isLoading && { opacity: 0.6 },
              ]}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color={theme.colors.white} />
              ) : (
                <>
                  <MaterialIcons name="login" size={20} color={theme.colors.white} />
                  <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
                </>
              )}
            </Pressable>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              ¿No tienes cuenta?{' '}
              <Text style={styles.link} onPress={() => router.push('/(onboarding)/register')}>
                Regístrate
              </Text>
            </Text>
          </View>
        </View>
      </ScrollView>
      <Toast message={toast} onDismiss={() => setToast(null)} position="bottom" />
    </View>
  );
}
