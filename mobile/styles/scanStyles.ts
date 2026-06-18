import { StyleSheet } from 'react-native';
import { AppTheme } from './theme';

export function createScanStyles(theme: AppTheme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.black,
    },
    cameraContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    statusContainer: {
      position: 'absolute',
      bottom: 240,
      alignSelf: 'center',
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.borderRadius.full,
    },
    statusDot: {
      width: 12,
      height: 12,
      borderRadius: 6,
    },
    statusText: {
      color: '#111',
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.semibold,
      letterSpacing: 0.5,
    },
    floatingCameraButton: {
      position: 'absolute',
      bottom: 140,
      alignSelf: 'center',
      width: 80,
      height: 80,
      borderRadius: 40,
      alignItems: 'center',
      justifyContent: 'center',
    },
    flipCameraButton: {
      position: 'absolute',
      bottom: 140,
      right: theme.spacing.xl,
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    hintText: {
      position: 'absolute',
      bottom: 100,
      alignSelf: 'center',
      color: theme.colors.white,
      fontSize: theme.typography.fontSize.sm,
      opacity: 0.7,
    },
  });
}
