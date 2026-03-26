import { Tabs } from 'expo-router'
import { useAppTheme } from '../../styles/theme'
// @ts-ignore
import MaterialIcons from '@expo/vector-icons/build/MaterialIcons'

export default function TabsLayout() {
  const theme = useAppTheme()

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: `${theme.colors.surfaceContainerLowest}80`,
          borderTopColor: 'transparent',
          borderTopWidth: 0,
          position: 'absolute',
          left: '5%',
          right: '5%',
          bottom: 24,
          height: 60,
          borderRadius: theme.borderRadius.full,
          shadowColor: theme.colors.primary,
          shadowOffset: { width: 0, height: 20 },
          shadowOpacity: 0.08,
          shadowRadius: 40,
          elevation: 8,
          paddingHorizontal: 16,
        },
        tabBarItemStyle: {
          paddingVertical: 8,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '700',
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <MaterialIcons name="home" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="history" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  )
}
