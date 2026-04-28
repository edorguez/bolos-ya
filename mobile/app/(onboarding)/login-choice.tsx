import { View, Text, StyleSheet, Pressable, Dimensions, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '../../styles/theme';
import { signIn, authClient } from '../../lib/auth-client';
import Svg, { Path } from 'react-native-svg';
import { MaterialIcons } from '@expo/vector-icons';
import { useState } from 'react';

const { width, height } = Dimensions.get('window');
const isLargeScreen = height > 800;
const isExtraLargeScreen = height > 900;

export default function LoginChoiceScreen() {
  const router = useRouter();
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isGuestLoading, setIsGuestLoading] = useState(false);
  const isAnyLoading = isGoogleLoading || isGuestLoading;

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    try {
      await signIn.social({
        provider: 'google',
        callbackURL: 'bolosya://callback',
      });
    } catch {
      setIsGoogleLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setIsGuestLoading(true);
    try {
      await authClient.$fetch('/sign-in/anonymous', { method: 'POST' });
    } catch {
      setIsGuestLoading(false);
    }
  };

  const headerHeight = 200;
  const phoneWidth = Math.min(width * 0.5, 280);
  const phoneHeight = phoneWidth * 1.4;
  const phoneScale = isExtraLargeScreen ? 0.9 : isLargeScreen ? 0.8 : 0.7;
  const scaledPhoneWidth = phoneWidth * phoneScale;
  const scaledPhoneHeight = phoneHeight * phoneScale;
  const blobScale = isExtraLargeScreen ? 1 : isLargeScreen ? 0.9 : 0.8;
  const badgeLeft = -Math.min(40, width * 0.08);
  const badgeRight = -Math.min(50, width * 0.1);
  const mainMarginTop = isExtraLargeScreen ? -30 : isLargeScreen ? -35 : -40;
  const mainPaddingBottom = isExtraLargeScreen
    ? theme.spacing.xl
    : isLargeScreen
      ? theme.spacing.xl
      : theme.spacing.xxl;
  const headlineMarginBottom = isExtraLargeScreen ? theme.spacing.lg : theme.spacing.xl;
  const actionsGap = isExtraLargeScreen ? theme.spacing.md : theme.spacing.md;
  const titleFontSize = isExtraLargeScreen
    ? theme.typography.fontSize.xxl
    : isLargeScreen
      ? theme.typography.fontSize.xl
      : theme.typography.fontSize.lg;
  const titleLineHeight = titleFontSize * 1.2;

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      width: '100%',
      height: headerHeight,
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      position: 'relative',
      zIndex: 1,
    },
    blob1: {
      position: 'absolute',
      top: -60 * blobScale,
      right: -60 * blobScale,
      width: 280 * blobScale,
      height: 280 * blobScale,
      backgroundColor: `${theme.colors.primary}10`,
      borderRadius: '42% 58% 70% 30% / 45% 45% 55% 55%',
      opacity: 0.5,
    },
    blob2: {
      position: 'absolute',
      top: 120 * blobScale,
      left: -60 * blobScale,
      width: 220 * blobScale,
      height: 220 * blobScale,
      backgroundColor: `${theme.colors.secondary}10`,
      borderRadius: '42% 58% 70% 30% / 45% 45% 55% 55%',
      opacity: 0.3,
    },
    blob3: {
      position: 'absolute',
      bottom: -30 * blobScale,
      right: 30 * blobScale,
      width: 160 * blobScale,
      height: 160 * blobScale,
      backgroundColor: `${theme.colors.tertiary}20`,
      borderRadius: '42% 58% 70% 30% / 45% 45% 55% 55%',
      opacity: 0.3,
    },
    phoneMockup: {
      width: scaledPhoneWidth,
      height: scaledPhoneHeight,
      backgroundColor: theme.colors.onSurface,
      borderRadius: 48,
      padding: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 20 },
      shadowOpacity: 0.3,
      shadowRadius: 40,
      elevation: 16,
      transform: [{ rotate: '6deg' }],
    },
    phoneScreen: {
      flex: 1,
      backgroundColor: theme.colors.surfaceContainerLowest,
      borderRadius: 36,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    phoneHeader: {
      height: 56 * phoneScale,
      backgroundColor: theme.colors.primary,
      padding: 16 * phoneScale,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    phoneSignal: {
      width: 80 * phoneScale,
      height: 12 * phoneScale,
      backgroundColor: 'rgba(255, 255, 255, 0.3)',
      borderRadius: 6 * phoneScale,
    },
    phoneDots: {
      flexDirection: 'row',
      gap: 4,
    },
    phoneDot: {
      width: 8 * phoneScale,
      height: 8 * phoneScale,
      borderRadius: 4 * phoneScale,
      backgroundColor: theme.colors.tertiary,
    },
    phoneDotSecondary: {
      backgroundColor: theme.colors.secondary,
    },
    phoneContent: {
      padding: 16 * phoneScale,
      gap: 16 * phoneScale,
    },
    phoneLine: {
      height: 16,
      backgroundColor: theme.colors.surfaceContainer,
      borderRadius: 8,
      width: '75%',
    },
    phoneItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12 * phoneScale,
      padding: 12 * phoneScale,
      backgroundColor: theme.colors.surfaceContainerLow,
      borderRadius: 20 * phoneScale,
    },
    phoneItemIcon: {
      width: 24 * phoneScale,
      height: 24 * phoneScale,
      borderRadius: 6 * phoneScale,
      backgroundColor: `${theme.colors.tertiary}20`,
      alignItems: 'center',
      justifyContent: 'center',
    },
    phoneItemLine: {
      height: 8 * phoneScale,
      backgroundColor: `${theme.colors.onSurfaceVariant}20`,
      borderRadius: 4 * phoneScale,
    },
    phoneCart: {
      marginTop: 32 * phoneScale,
      width: '100%',
      height: 48 * phoneScale,
      backgroundColor: `${theme.colors.primary}10`,
      borderRadius: 24 * phoneScale,
      alignItems: 'center',
      justifyContent: 'center',
    },
    floatingBadge1: {
      position: 'absolute',
      left: badgeLeft,
      top: '25%',
      backgroundColor: 'rgba(255, 255, 255, 0.7)',
      padding: 12 * phoneScale,
      borderRadius: 20 * phoneScale,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8 * phoneScale,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.4)',
    },
    floatingBadge2: {
      position: 'absolute',
      right: badgeRight,
      bottom: '25%',
      backgroundColor: 'rgba(255, 255, 255, 0.7)',
      padding: 12 * phoneScale,
      borderRadius: 20 * phoneScale,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8 * phoneScale,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.4)',
    },
    badgeIcon: {
      backgroundColor: theme.colors.tertiary,
      padding: 4 * phoneScale,
      borderRadius: 12 * phoneScale,
    },
    badgeIconSecondary: {
      backgroundColor: theme.colors.secondary,
    },
    badgeText: {
      fontSize: 10 * phoneScale,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.text,
    },
    main: {
      flex: 1,
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.xl,
      paddingBottom: mainPaddingBottom,
      backgroundColor: theme.colors.surfaceContainerLowest,
      borderTopLeftRadius: 48,
      borderTopRightRadius: 48,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -10 },
      shadowOpacity: 0.05,
      shadowRadius: 40,
      elevation: 8,
    },
    headline: {
      alignItems: 'center',
      marginBottom: headlineMarginBottom,
    },
    title: {
      fontSize: titleFontSize,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.text,
      lineHeight: titleLineHeight,
      textAlign: 'center',
      marginBottom: theme.spacing.sm,
    },
    titlePrimary: {
      color: theme.colors.primary,
    },
    subtitle: {
      fontSize: theme.typography.fontSize.md,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      paddingHorizontal: theme.spacing.md,
    },
    actions: {
      width: '100%',
      maxWidth: 400,
      alignSelf: 'center',
      gap: actionsGap,
    },
    googleButton: {
      width: '100%',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: theme.spacing.md,
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
      backgroundColor: theme.colors.surfaceContainerLow,
      borderRadius: theme.borderRadius.full,
    },
    googleButtonText: {
      fontSize: theme.typography.fontSize.md,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.text,
    },
    emailButton: {
      width: '100%',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: theme.spacing.md,
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
      backgroundColor: theme.colors.primary,
      borderRadius: theme.borderRadius.full,
      shadowColor: theme.colors.primary,
      shadowOffset: { width: 0, height: 20 },
      shadowOpacity: 0.2,
      shadowRadius: 40,
      elevation: 8,
    },
    emailButtonText: {
      fontSize: theme.typography.fontSize.md,
      fontWeight: theme.typography.fontWeight.bold,
      color: '#FFFFFF',
    },
    registerButton: {
      width: '100%',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: theme.spacing.md,
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
      backgroundColor: 'transparent',
      borderRadius: theme.borderRadius.full,
      borderWidth: 2,
      borderColor: theme.colors.primary,
    },
    registerButtonText: {
      fontSize: theme.typography.fontSize.md,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.primary,
    },
    divider: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.md,
      paddingVertical: theme.spacing.md,
    },
    dividerLine: {
      flex: 1,
      height: 2,
      backgroundColor: theme.colors.surfaceContainer,
    },
    dividerText: {
      fontSize: theme.typography.fontSize.xs,
      color: theme.colors.textSecondary,
      fontWeight: theme.typography.fontWeight.medium,
      letterSpacing: 1,
      textTransform: 'uppercase',
    },
    guestButton: {
      width: '100%',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: theme.spacing.md,
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
      backgroundColor: 'transparent',
      borderRadius: theme.borderRadius.full,
      borderWidth: 2,
      borderColor: 'transparent',
    },
    guestButtonText: {
      fontSize: theme.typography.fontSize.md,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.secondary,
    },
    footer: {
      marginTop: 'auto',
      paddingTop: theme.spacing.xl,
      alignItems: 'center',
    },
    footerText: {
      fontSize: theme.typography.fontSize.xs,
      color: `${theme.colors.textSecondary}60`,
      textAlign: 'center',
    },
    link: {
      textDecorationLine: 'underline',
      fontWeight: theme.typography.fontWeight.semibold,
      color: `${theme.colors.primary}70`,
    },
  });

  const GoogleIcon = () => (
    <Svg width={20} height={20} viewBox="0 0 24 24">
      <Path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <Path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <Path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <Path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </Svg>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ flexGrow: 1 }}>
      <View style={styles.header}>
        <View style={styles.blob1} />
        <View style={styles.blob2} />
        <View style={styles.blob3} />

        <View style={styles.phoneMockup}>
          <View style={styles.phoneScreen}>
            <View style={styles.phoneHeader}>
              <View style={styles.phoneSignal} />
              <View style={styles.phoneDots}>
                <View style={styles.phoneDot} />
                <View style={[styles.phoneDot, styles.phoneDotSecondary]} />
              </View>
            </View>
            <View style={styles.phoneContent}>
              <View style={styles.phoneLine} />
              <View style={styles.phoneItem}>
                <View style={styles.phoneItemIcon}>
                  <MaterialIcons name="check" size={14} color={theme.colors.tertiary} />
                </View>
                <View style={[styles.phoneItemLine, { width: 96 }]} />
              </View>
              <View style={styles.phoneItem}>
                <View
                  style={[styles.phoneItemIcon, { backgroundColor: `${theme.colors.secondary}20` }]}
                />
                <View style={[styles.phoneItemLine, { width: 128 }]} />
              </View>
              <View style={styles.phoneItem}>
                <View
                  style={[styles.phoneItemIcon, { backgroundColor: `${theme.colors.primary}20` }]}
                />
                <View style={[styles.phoneItemLine, { width: 80 }]} />
              </View>
              <View style={styles.phoneCart}>
                <MaterialIcons name="add-shopping-cart" size={24} color={theme.colors.primary} />
              </View>
            </View>
          </View>
        </View>

        <View style={styles.floatingBadge1}>
          <View style={styles.badgeIcon}>
            <MaterialIcons name="local-mall" size={12} color="#FFFFFF" />
          </View>
          <Text style={styles.badgeText}>Lista lista!</Text>
        </View>

        <View style={styles.floatingBadge2}>
          <Text style={styles.badgeText}>Total: $45.00</Text>
          <View style={[styles.badgeIcon, styles.badgeIconSecondary]}>
            <MaterialIcons name="payments" size={12} color="#FFFFFF" />
          </View>
        </View>
      </View>

      <View style={styles.main}>
        <View style={styles.headline}>
          <Text style={styles.title}>
            MercadoLibreta: <Text style={styles.titlePrimary}>Tu Aliado en Caja</Text>
          </Text>
          <Text style={styles.subtitle}>
            Organiza tus compras, controla tu presupuesto y nunca olvides lo esencial.
          </Text>
        </View>

        <View style={styles.actions}>
          <Pressable
            onPress={handleGoogleLogin}
            disabled={isAnyLoading}
            style={({ pressed }) => [
              styles.googleButton,
              pressed && { opacity: 0.8 },
              isAnyLoading && { opacity: 0.6 },
            ]}
          >
            {isGoogleLoading ? (
              <ActivityIndicator size="small" color={theme.colors.text} />
            ) : (
              <GoogleIcon />
            )}
            <Text style={styles.googleButtonText}>Continuar con Google</Text>
          </Pressable>

          <Pressable
            onPress={() => router.push('/(onboarding)/login')}
            disabled={isAnyLoading}
            style={({ pressed }) => [
              styles.emailButton,
              pressed && { opacity: 0.8 },
              isAnyLoading && { opacity: 0.6 },
            ]}
          >
            <MaterialIcons name="mail" size={20} color="#FFFFFF" />
            <Text style={styles.emailButtonText}>Iniciar con Correo</Text>
          </Pressable>

          <Pressable
            onPress={() => router.push('/(onboarding)/register')}
            disabled={isAnyLoading}
            style={({ pressed }) => [
              styles.registerButton,
              pressed && { opacity: 0.8 },
              isAnyLoading && { opacity: 0.6 },
            ]}
          >
            <MaterialIcons name="person-add" size={20} color={theme.colors.primary} />
            <Text style={styles.registerButtonText}>Registrarse con correo</Text>
          </Pressable>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>O también</Text>
            <View style={styles.dividerLine} />
          </View>

          <Pressable
            onPress={handleGuestLogin}
            disabled={isAnyLoading}
            style={({ pressed }) => [
              styles.guestButton,
              pressed && { opacity: 0.8 },
              isAnyLoading && { opacity: 0.6 },
            ]}
          >
            {isGuestLoading ? (
              <ActivityIndicator size="small" color={theme.colors.secondary} />
            ) : (
              <>
                <Text style={styles.guestButtonText}>Entrar como Invitado</Text>
                <MaterialIcons name="arrow-forward" size={20} color={theme.colors.secondary} />
              </>
            )}
          </Pressable>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Al continuar, aceptas nuestros <Text style={styles.link}>Términos de Servicio</Text> y{' '}
            <Text style={styles.link}>Política de Privacidad</Text>.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
