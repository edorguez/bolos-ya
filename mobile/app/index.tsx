import { Redirect } from 'expo-router';
import { useSession } from '../lib/auth-client';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useAppTheme } from '../styles/theme';

export default function Index() {
  const theme = useAppTheme();
  const { data: session, isPending } = useSession();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.background,
    },
  });

  if (isPending) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={theme.colors.midnight} />
      </View>
    );
  }

  if (session) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/(onboarding)/welcome" />;
}
