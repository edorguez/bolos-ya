import { Tabs } from 'expo-router'
import { useAppTheme } from '../../styles/theme'
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native'
import { BottomTabBarProps } from '@react-navigation/bottom-tabs'
import { MaterialIcons } from '@expo/vector-icons'

function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const theme = useAppTheme()

  const styles = StyleSheet.create({
    container: {
      position: 'absolute',
      bottom: theme.spacing.md,
      left: 0,
      right: 0,
      alignItems: 'center',
      justifyContent: 'center',
    },
    tabBar: {
      flexDirection: 'row',
      width: '90%',
      maxWidth: 400,
      borderRadius: 9999,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.sm,
      shadowColor: theme.colors.primary,
      shadowOffset: { width: 0, height: 20 },
      shadowOpacity: 0.08,
      shadowRadius: 40,
      elevation: 8,
    },
    tabItem: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      borderRadius: 9999,
    },
    activeTabItem: {
      shadowColor: theme.colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 4,
    },
    tabIcon: {
      marginBottom: theme.spacing.xxs,
    },
    tabLabel: {
      fontSize: theme.typography.fontSize.xxs,
      fontWeight: theme.typography.fontWeight.bold,
    },
  })

  return (
    <View style={styles.container}>
      <View
        style={[styles.tabBar, { backgroundColor: `${theme.colors.surfaceContainerLowest}80` }]}
      >
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key]
          const label = options.title || route.name
          const isFocused = state.index === index

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            })

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name)
            }
          }

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            })
          }

          let iconName = 'circle'
          if (route.name === 'index') iconName = 'home'
          if (route.name === 'history') iconName = 'receipt'
          if (route.name === 'profile') iconName = 'person'

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel || label}
              onPress={onPress}
              onLongPress={onLongPress}
              style={[
                styles.tabItem,
                isFocused && [styles.activeTabItem, { backgroundColor: theme.colors.primary }],
              ]}
            >
              <MaterialIcons
                name={iconName as any}
                size={24}
                color={isFocused ? '#FFFFFF' : theme.colors.textSecondary}
                style={styles.tabIcon}
              />
              <Text
                style={[
                  styles.tabLabel,
                  { color: isFocused ? '#FFFFFF' : theme.colors.textSecondary },
                ]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          )
        })}
      </View>
    </View>
  )
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
      }}
      tabBar={props => <CustomTabBar {...props} />}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'Historial',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
        }}
      />
    </Tabs>
  )
}
