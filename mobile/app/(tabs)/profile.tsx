import { View, Text, ScrollView, Pressable, type ViewStyle, type TextStyle } from 'react-native';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import { profileStyles } from '../../styles/profileStyles';
import { Avatar } from '../../components/profile/Avatar';
import { PremiumCard } from '../../components/profile/PremiumCard';
import { SettingItem } from '../../components/profile/SettingItem';
import { GuestCard } from '../../components/profile/GuestCard';
import { useAppTheme } from '../../styles/theme';
import { useAuth } from '../../store/authStore';

export default function ProfileTab() {
  const theme = useAppTheme();
  const router = useRouter();
  const { user, logout, isAuthenticated } = useAuth();
  const isPremium = user?.isPremium || false;
  const styles = profileStyles(theme);

  const settingsItems = [
    {
      id: 'account',
      title: 'Mi Cuenta',
      icon: 'person',
      iconColor: theme.colors.midnight,
      iconBgColor: theme.colors.stoneSurface,
    },
    {
      id: 'notifications',
      title: 'Notificaciones',
      icon: 'notifications',
      iconColor: theme.colors.midnight,
      iconBgColor: theme.colors.stoneSurface,
    },
    {
      id: 'security',
      title: 'Seguridad',
      icon: 'shield',
      iconColor: theme.colors.midnight,
      iconBgColor: theme.colors.stoneSurface,
    },
  ];

  const handleLogout = async () => {
    await logout();
    router.replace('/(onboarding)/welcome');
  };

  const handleUpgrade = () => {
    console.log('Upgrade to premium');
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
        contentContainerStyle={styles.content as ViewStyle}
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

            {!isPremium && <PremiumCard onUpgradePress={handleUpgrade} />}

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
    </View>
  );
}
