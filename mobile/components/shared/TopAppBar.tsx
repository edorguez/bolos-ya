import { View, Text, Pressable, type ViewStyle } from 'react-native';
import { StyleSheet as RNStyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { useAppTheme } from '../../styles/theme';
import { MaterialIcons } from '@expo/vector-icons';
import { MERKI_LOGO } from '../../constants/images';

interface TopAppBarProps {
  title?: string;
  logo?: boolean;
  rightLabel?: string;
  onBackPress?: () => void;
  showBackButton?: boolean;
}

export function TopAppBar({
  title,
  logo = false,
  rightLabel,
  onBackPress,
  showBackButton = true,
}: TopAppBarProps) {
  const theme = useAppTheme();

  const baseContainerStyle: ViewStyle = {
    height: theme.sizes.appBar,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    zIndex: 50,
  };

  const styles = RNStyleSheet.create({
    container: {
      ...baseContainerStyle,
      position: 'relative',
      backgroundColor: theme.colors.surfaceContainerLowest,
    },
    leftContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      minWidth: theme.sizes.iconButton,
    },
    backButton: {
      width: theme.sizes.iconButton,
      height: theme.sizes.iconButton,
      borderRadius: theme.borderRadius.full,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.surfaceContainerLow,
    },
    centerContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    title: {
      fontSize: theme.typography.fontSize.lg,
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.charcoalPrimary,
      textAlign: 'center',
      letterSpacing: theme.typography.letterSpacing.lg,
    },
    logo: {
      height: 20,
      aspectRatio: 1380 / 664,
    },
    rightContainer: {
      minWidth: theme.sizes.iconButton,
      alignItems: 'flex-end',
    },
    rightLabel: {
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.onSurfaceVariant,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.leftContainer}>
        {showBackButton && (
          <Pressable
            style={({ pressed }) => [styles.backButton, pressed && { opacity: 0.8 }]}
            onPress={onBackPress}
          >
            <MaterialIcons
              name="arrow-back"
              size={theme.iconSize.lg}
              color={theme.colors.onSurfaceVariant}
            />
          </Pressable>
        )}
      </View>

      <View style={styles.centerContainer}>
        {logo ? (
          <Image source={MERKI_LOGO} style={styles.logo} resizeMode="contain" />
        ) : (
          <Text style={styles.title}>{title}</Text>
        )}
      </View>

      <View style={styles.rightContainer}>
        {rightLabel && <Text style={styles.rightLabel}>{rightLabel}</Text>}
      </View>
    </View>
  );
}
