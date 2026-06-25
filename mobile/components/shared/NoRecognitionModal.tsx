import { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Pressable,
  Modal,
  Animated,
  Dimensions,
  type ViewStyle,
  type TextStyle,
} from 'react-native';
import { StyleSheet } from '../../styles/createStyleSheet';
import { useAppTheme } from '../../styles/theme';
import { MaterialIcons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const MODAL_WIDTH = Math.min(SCREEN_WIDTH * 0.9, 400);

interface NoRecognitionModalProps {
  isVisible: boolean;
  onClose: () => void;
  onManualEntry: () => void;
}

const stylesheet = StyleSheet.create(theme => ({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    marginBottom: theme.spacing.xxl,
  },
  modalContent: {
    width: MODAL_WIDTH,
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.stoneSurface,
    gap: theme.spacing.md,
  },
  headerTitle: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.emberOrange,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  message: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.regular,
    color: theme.colors.onSurface,
    lineHeight: 22,
  },
  actionRow: {
    flexDirection: 'row',
    gap: theme.spacing.xxs,
    marginTop: theme.spacing.sm,
  },
  retryButton: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.button,
    borderWidth: 1,
    borderColor: theme.colors.stoneSurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  retryButtonText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.onSurfaceVariant,
  },
  manualButton: {
    flex: 1,
    backgroundColor: theme.colors.midnight,
    borderRadius: theme.borderRadius.button,
    paddingVertical: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  manualButtonText: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
  },
}));

export function NoRecognitionModal({ isVisible, onClose, onManualEntry }: NoRecognitionModalProps) {
  const theme = useAppTheme();
  const styles = stylesheet(theme);

  const slideAnim = useRef(new Animated.Value(500)).current;

  useEffect(() => {
    if (isVisible) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 500,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [isVisible, slideAnim]);

  return (
    <Modal visible={isVisible} transparent animationType="none" onRequestClose={onClose}>
      <Pressable style={styles.modalContainer as ViewStyle} onPress={onClose}>
        <Animated.View style={{ transform: [{ translateY: slideAnim }] }}>
          <Pressable style={styles.modalContent as ViewStyle} onPress={e => e.stopPropagation()}>
            <Text style={styles.headerTitle as TextStyle}>Producto no detectado</Text>

            <Text style={styles.message as TextStyle}>
              No se pudo reconocer el producto. Intenta tomar una foto más clara o ingresa los datos
              manualmente.
            </Text>

            <View style={styles.actionRow as ViewStyle}>
              <Pressable
                style={({ pressed }) => [
                  styles.retryButton as ViewStyle,
                  pressed && { opacity: 0.8 },
                ]}
                onPress={onClose}
              >
                <Text style={styles.retryButtonText as TextStyle}>Reintentar</Text>
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  styles.manualButton as ViewStyle,
                  pressed && { opacity: 0.8 },
                ]}
                onPress={() => {
                  onClose();
                  onManualEntry();
                }}
              >
                <Text style={styles.manualButtonText as TextStyle}>Ingreso manual</Text>
              </Pressable>
            </View>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}
