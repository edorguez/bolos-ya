import { View, Pressable, type ViewStyle } from 'react-native';
import { StyleSheet } from '../../styles/createStyleSheet';
import { useAppTheme } from '../../styles/theme';
import { useRouter, useSegments } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

interface BottomNavBarProps {
  activeRoute?: string;
}

const stylesheet = StyleSheet.create(theme => ({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.colors.background,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    width: '90%',
    maxWidth: 400,
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderRadius: theme.borderRadius.button,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.md,
  },
  navItemActive: {
    backgroundColor: theme.colors.midnight,
  },
}));

export function BottomNavBar({ activeRoute }: BottomNavBarProps) {
  const theme = useAppTheme();
  const styles = stylesheet(theme);
  const router = useRouter();
  const segments = useSegments();

  const currentRoute = activeRoute || segments[0] || 'index';

  const navItems = [
    { id: 'home', icon: 'home' as const, route: 'home' as const, target: '/(tabs)/index' as const },
    { id: 'cart', icon: 'local-mall' as const, route: 'cart' as const, target: null },
    {
      id: 'favorites',
      icon: 'favorite' as const,
      route: 'favorites' as const,
      target: '/(tabs)/history' as const,
    },
    {
      id: 'profile',
      icon: 'person' as const,
      route: 'profile' as const,
      target: '/(tabs)/profile' as const,
    },
  ] as const;

  const handlePress = (target: string | null) => {
    if (target) {
      router.push(target as any);
    }
  };

  return (
    <View style={styles.container as ViewStyle}>
      <View style={styles.nav as ViewStyle}>
        {navItems.map(item => {
          const isActive = currentRoute === item.route;
          return (
            <Pressable
              key={item.id}
              style={[styles.navItem as ViewStyle, isActive && (styles.navItemActive as ViewStyle)]}
              onPress={() => handlePress(item.target)}
            >
              <MaterialIcons
                name={item.icon as any}
                size={24}
                color={isActive ? theme.colors.white : theme.colors.textSecondary}
              />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
