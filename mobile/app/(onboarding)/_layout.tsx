import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native';
import { useAppTheme } from '../../styles/theme';
import { StatusBar } from 'expo-status-bar';
import { OnboardingChrome } from '../../components/onboarding/OnboardingChrome';

export default function OnboardingLayout() {
  const theme = useAppTheme();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
  });

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <StatusBar style="dark" translucent backgroundColor="transparent" />
      <OnboardingChrome>
        <Stack
          screenOptions={{
            headerShown: false,
            animation: 'slide_from_right',
            contentStyle: { backgroundColor: 'transparent' },
          }}
        >
          <Stack.Screen name="step-1" />
          <Stack.Screen name="step-2" />
          <Stack.Screen name="step-3" />
          <Stack.Screen name="step-4" />
          <Stack.Screen name="login-choice" />
          <Stack.Screen name="login" />
          <Stack.Screen name="register" />
        </Stack>
      </OnboardingChrome>
    </SafeAreaView>
  );
}
