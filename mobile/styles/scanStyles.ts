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
    overlayPanels: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      flexDirection: 'column',
    },
    overlayTint: {
      backgroundColor: 'rgba(0, 0, 0, 0.4)',
    },
    overlayMiddleRow: {
      flexDirection: 'row',
      height: 180,
      alignItems: 'stretch',
    },
    scanArea: {
      width: '80%',
      maxWidth: 380,
      height: 180,
    },
    cornerLine: {
      position: 'absolute',
      backgroundColor: '#fff',
      borderRadius: 1.5,
    },
    cornerVertical: {
      width: 3,
      height: 24,
    },
    cornerHorizontal: {
      width: 24,
      height: 3,
    },
    hintText: {
      position: 'absolute',
      bottom: 90,
      alignSelf: 'center',
      color: theme.colors.white,
      fontSize: theme.typography.fontSize.sm,
      textAlign: 'center',
      opacity: 0.7,
    },
  });
}
