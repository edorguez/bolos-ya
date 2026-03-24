import { Tabs } from 'expo-router'
import { useAppTheme } from '../../styles/theme'

export default function TabsLayout() {
  const theme = useAppTheme()

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        headerShown: false,
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="carts" options={{ title: 'Carts' }} />
      <Tabs.Screen name="prices" options={{ title: 'Prices' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
  )
}