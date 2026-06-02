import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native';
import { useAppTheme } from '../styles/theme';
import { useBCV } from '../store/bcvStore';
import '../styles/unistylesConfigured';

export default function RootLayout() {
  const theme = useAppTheme();
	useBCV();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          contentStyle: { backgroundColor: 'transparent' },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(cart)" />
        <Stack.Screen name="(premium)" />
        <Stack.Screen name="+not-found" />
      </Stack>
    </SafeAreaView>
  );
}
