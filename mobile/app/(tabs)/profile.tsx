import { View, Text, ScrollView, Pressable, type ViewStyle, type TextStyle } from 'react-native';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import { profileStyles } from '../../styles/profileStyles';
import { Avatar } from '../../components/profile/Avatar';
import { PremiumCard } from '../../components/profile/PremiumCard';
import { PremiumActiveCard } from '../../components/profile/PremiumActiveCard';
import { AnonymousPromptCard } from '../../components/profile/AnonymousPromptCard';
import { GuestCard } from '../../components/profile/GuestCard';
import { Toast } from '../../components/shared/Toast';
import { useAppTheme } from '../../styles/theme';
import { useAuth } from '../../store/authStore';
import { getPaymentsByUser, PENDING_STATUS_ID } from '../../services/paymentService';
import { useState, useEffect } from 'react';
import * as Network from 'expo-network';

export default function ProfileTab() {
  const theme = useAppTheme();
  const router = useRouter();
  const { user, logout, isAuthenticated } = useAuth();
  const isPremium = user?.isPremium || false;
  const styles = profileStyles(theme);
  const [isOnline, setIsOnline] = useState(true);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    Network.getNetworkStateAsync().then(state => {
      setIsOnline(state.isConnected ?? true);
    });
  }, []);

  const handleLogout = async () => {
    await logout();
    router.replace('/(onboarding)/welcome');
  };

  const handleUpgrade = async () => {
    if (!isOnline) {
      setToast('Se necesita conexión a internet para gestionar tu suscripción');
      return;
    }
    try {
      const pendingPayments = await getPaymentsByUser(user!.userId!, PENDING_STATUS_ID);
      if (pendingPayments.length > 0) {
        router.push('/(premium)/payment-pending');
      } else {
        router.push('/(premium)/plans');
      }
    } catch {
      router.push('/(premium)/plans');
    }
  };

  const handleCreateAccount = () => {
    router.push('/(onboarding)/login-choice');
  };

  return (
    <View style={styles.container as ViewStyle}>
      <View style={styles.header as ViewStyle}>
        <Text style={styles.headerTitle as TextStyle}>MercadoLibreta</Text>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content as ViewStyle, { paddingBottom: 140 }]}
        showsVerticalScrollIndicator={false}
      >
        {isAuthenticated ? (
          <>
            <View style={styles.profileHeader as ViewStyle}>
              <Avatar uri={user?.image || undefined} />

              {!user?.isAnonymous ? (
                <Text style={styles.profileName as TextStyle}>{user?.name}</Text>
              ) : (
                <Text style={styles.profileName as TextStyle}>Usuario</Text>
              )}

              {!user?.isAnonymous && (
                <Text style={styles.profileEmail as TextStyle}>{user?.email || ''}</Text>
              )}
            </View>

            {user?.isAnonymous ? (
              <AnonymousPromptCard onLoginPress={handleCreateAccount} />
            ) : isPremium ? (
              <PremiumActiveCard premiumUntil={user?.premiumUntil} onUpgradePress={handleUpgrade} />
            ) : (
              <PremiumCard onUpgradePress={handleUpgrade} />
            )}

            {!user?.isAnonymous && (
              <Pressable
                style={({ pressed }) => [
                  styles.logoutButton as ViewStyle,
                  pressed && (styles.logoutButtonPressed as ViewStyle),
                ]}
                onPress={handleLogout}
              >
                <Text style={styles.logoutText as TextStyle}>Cerrar Sesión</Text>
              </Pressable>
            )}
          </>
        ) : (
          <GuestCard onCreateAccountPress={handleCreateAccount} />
        )}

        <Text style={styles.versionText as TextStyle}>
          MercadoLibreta v{Constants.expoConfig?.version || '2.4.0'}
        </Text>
      </ScrollView>
      <Toast message={toast} onDismiss={() => setToast(null)} />
    </View>
  );
}
