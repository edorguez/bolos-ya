import { Redirect } from 'expo-router';
import { useSession } from '../lib/auth-client';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { useAppTheme } from '../styles/theme';
import { SPLASH_LOGO } from '../constants/images';

export default function Index() {
  const theme = useAppTheme();
  const { data: session, isPending } = useSession();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.background,
      gap: theme.spacing.lg,
    },
    logo: {
      width: 140,
      height: 140,
    },
  });

  if (isPending) {
    return (
      <View style={styles.container}>
        <Image source={SPLASH_LOGO} style={styles.logo} contentFit="contain" />
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (session) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/(onboarding)/step-1" />;
}
