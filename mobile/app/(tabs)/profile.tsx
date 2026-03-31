import { View, Text, ScrollView, Pressable } from 'react-native'
import { useAuthStore } from '../../store/authStore'
import Constants from 'expo-constants'
import { profileStyles } from '../../styles/profileStyles'
import { Avatar } from '../../components/profile/Avatar'
import { PremiumCard } from '../../components/profile/PremiumCard'
import { SettingItem } from '../../components/profile/SettingItem'
import { GuestCard } from '../../components/profile/GuestCard'
import { useAppTheme } from '../../styles/theme'

export default function ProfileTab() {
  const theme = useAppTheme()
  const { user, logout } = useAuthStore()
  const isLoggedIn = !!user
  const isPremium = user?.isPremium || false
  const styles = profileStyles

  const settingsItems = [
    {
      id: 'account',
      title: 'Mi Cuenta',
      icon: 'person',
      iconColor: theme.colors.primary,
      iconBgColor: theme.colors.primaryContainer + '20',
    },
    {
      id: 'notifications',
      title: 'Notificaciones',
      icon: 'notifications',
      iconColor: theme.colors.secondary,
      iconBgColor: theme.colors.secondaryContainer + '20',
    },
    {
      id: 'security',
      title: 'Seguridad',
      icon: 'shield',
      iconColor: theme.colors.error,
      iconBgColor: theme.colors.errorContainer + '10',
    },
  ]

  const handleUpgrade = () => {
    console.log('Upgrade to premium')
  }

  const handleCreateAccount = () => {
    console.log('Navigate to create account')
  }

  const handleSettingPress = (id: string) => {
    console.log(`Setting pressed: ${id}`)
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>MercadoLibreta</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {isLoggedIn ? (
          <>
            <View style={styles.profileHeader}>
              <Avatar
                uri="https://lh3.googleusercontent.com/aida-public/AB6AXuALMw21RDhWqJmtNwfLbQ_9DXpMfPF6ZFl1sSIsM_qYnbOCbr68RdeQCeXKn4g9PUuUCZ97Xfh9I4xvNFSHd_BPRvHEPOTqWc5i6lX2iNeGT1UUuS5IasY6ofdQKB3N0ON8l6XP_o5HOiie7jek6UP_EVebOCyNWzPLZDVhVajA98wuD53JHy9qPJiMZvxL0dwy8J7InjugKp2dHmW3HwpDczEzG9uR0TJ2mQPXaokiuTLrTi4Z04XAjCCAdY9_YfjF0Wt-v4aZ-HG3"
                onEditPress={() => console.log('Edit avatar')}
              />
              <Text style={styles.profileName}>
                {user?.email ? user.email.split('@')[0] : 'Usuario'}
              </Text>
              <Text style={styles.profileName}>{user?.email || 'juan.perez@email.com'}</Text>
            </View>

            {!isPremium && <PremiumCard onUpgradePress={handleUpgrade} />}

            <Text style={styles.sectionTitle}>Ajustes</Text>
            <View style={styles.settingsContainer}>
              {settingsItems.map(item => (
                <SettingItem
                  key={item.id}
                  title={item.title}
                  icon={item.icon}
                  iconColor={item.iconColor}
                  iconBgColor={item.iconBgColor}
                  onPress={() => handleSettingPress(item.id)}
                />
              ))}
            </View>

            <Pressable
              style={({ pressed }) => [styles.logoutButton, pressed && styles.logoutButtonPressed]}
              onPress={logout}
            >
              <Text style={styles.logoutText}>Cerrar Sesión</Text>
            </Pressable>
          </>
        ) : (
          <GuestCard onCreateAccountPress={handleCreateAccount} />
        )}

        <Text style={styles.versionText}>
          MercadoLibreta v{Constants.expoConfig?.version || '2.4.0'}
        </Text>
      </ScrollView>
    </View>
  )
}
