import { View, Text, type ViewStyle, type TextStyle } from 'react-native';
import Animated from 'react-native-reanimated';
import { StyleSheet } from '../../styles/createStyleSheet';
import { useAppTheme } from '../../styles/theme';
import { createButtonStyles } from '../../styles/buttons';
import { useFloat } from '../../hooks/animations';
import { PressableScale } from '../shared/PressableScale';
import { MaterialIcons } from '@expo/vector-icons';

interface AnonymousPromptCardProps {
  onLoginPress?: () => void;
}

const stylesheet = StyleSheet.create(theme => {
  const buttonStyles = createButtonStyles(theme);
  return {
    card: {
      position: 'relative',
      overflow: 'hidden',
      backgroundColor: theme.colors.surfaceContainerLowest,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.xl,
      marginVertical: theme.spacing.lg,
      borderCurve: 'continuous',
      boxShadow: '0 0 0 1px rgba(201, 199, 195, 0.4) inset',
    },
    blob: {
      position: 'absolute',
      right: -40,
      top: -40,
      width: 160,
      height: 160,
      backgroundColor: theme.colors.skyBlue + '1A',
      borderRadius: 9999,
    },
    content: {
      position: 'relative',
      zIndex: 10,
      gap: theme.spacing.md,
    },
    badge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
      backgroundColor: theme.colors.iceBlue,
      alignSelf: 'flex-start',
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.borderRadius.sm,
      borderCurve: 'continuous',
    },
    badgeText: {
      fontSize: theme.typography.fontSize.xs,
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.white,
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
    title: {
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.charcoalPrimary,
      letterSpacing: theme.typography.letterSpacing.xl,
    },
    feature: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    featureText: {
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.medium,
      color: theme.colors.graphite,
      opacity: 0.8,
    },
    loginButton: {
      ...buttonStyles.base,
      backgroundColor: theme.colors.midnight,
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
      alignItems: 'center',
    },
    loginButtonText: {
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.medium,
      color: theme.colors.white,
    },
  };
});

const benefits = ['Sincroniza tu historial entre dispositivos', 'Accede a funciones Premium'];

export function AnonymousPromptCard({ onLoginPress }: AnonymousPromptCardProps) {
  const theme = useAppTheme();
  const styles = stylesheet(theme);
  const blobFloat = useFloat({ distance: 8, duration: 3600 });

  return (
    <View style={styles.card as ViewStyle}>
      <Animated.View style={[styles.blob as ViewStyle, blobFloat]} />
      <View style={styles.content as ViewStyle}>
        <View style={styles.badge as ViewStyle}>
          <MaterialIcons name="stars" size={14} color={theme.colors.white} />
          <Text style={styles.badgeText as TextStyle}>Cuenta</Text>
        </View>
        <Text style={styles.title as TextStyle}>Crea tu cuenta</Text>
        {benefits.map((benefit, index) => (
          <View key={index} style={styles.feature as ViewStyle}>
            <MaterialIcons name="check-circle" size={20} color={theme.colors.skyBlue} />
            <Text style={styles.featureText as TextStyle}>{benefit}</Text>
          </View>
        ))}
        <PressableScale
          pressedScale={1.03}
          style={styles.loginButton as ViewStyle}
          onPress={onLoginPress}
        >
          <Text style={styles.loginButtonText as TextStyle}>Registrarse</Text>
        </PressableScale>
      </View>
    </View>
  );
}
