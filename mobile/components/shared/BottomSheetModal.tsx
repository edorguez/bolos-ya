import {
  View,
  Text,
  Pressable,
  Dimensions,
  ScrollView,
  Keyboard,
  type ViewStyle,
  type TextStyle,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { StyleSheet } from '../../styles/createStyleSheet';
import { useAppTheme } from '../../styles/theme';
import { MaterialIcons } from '@expo/vector-icons';

interface BottomSheetModalProps {
  isVisible: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  showBackButton?: boolean;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const MODAL_HEIGHT = SCREEN_HEIGHT * 0.9;

const stylesheet = StyleSheet.create(theme => ({
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.onSurface,
    zIndex: 60,
  },
  modalContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: MODAL_HEIGHT,
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    zIndex: 70,
    borderWidth: 1,
    borderColor: theme.colors.stoneSurface,
    borderBottomWidth: 0,
  },
  handleContainer: {
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.md,
    alignItems: 'center',
  },
  handle: {
    width: 48,
    height: 4,
    backgroundColor: theme.colors.surfaceContainer,
    borderRadius: theme.borderRadius.full,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.stoneSurface,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surfaceContainerLow,
  },
  headerTitle: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.onSurface,
    letterSpacing: theme.typography.letterSpacing.lg,
  },
  headerSubtitle: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.onSurfaceVariant,
    marginTop: theme.spacing.xs,
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
  },
}));

export function BottomSheetModal({
  isVisible,
  onClose,
  title,
  subtitle,
  children,
  showBackButton = true,
}: BottomSheetModalProps) {
  const theme = useAppTheme();
  const styles = stylesheet(theme);

  const translateY = useSharedValue(MODAL_HEIGHT);
  const backdropOpacity = useSharedValue(0);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const closeModal = useCallback(() => {
    translateY.set(
      withTiming(MODAL_HEIGHT, { duration: 250 }, finished => {
        if (finished) runOnJS(onClose)();
      })
    );
    backdropOpacity.set(withTiming(0, { duration: 250 }));
  }, [translateY, backdropOpacity, onClose]);

  const panGesture = useMemo(
    () =>
      Gesture.Pan()
        .onUpdate(event => {
          if (event.translationY > 0) {
            translateY.set(Math.min(event.translationY, MODAL_HEIGHT));
          }
        })
        .onEnd(event => {
          if (event.translationY > 100 || event.velocityY > 500) {
            runOnJS(closeModal)();
          } else {
            translateY.set(withSpring(0, { damping: 20, stiffness: 200 }));
          }
        }),
    [translateY, closeModal]
  );

  const openModal = useCallback(() => {
    translateY.set(withTiming(0, { duration: 300 }));
    backdropOpacity.set(withTiming(0.3, { duration: 300 }));
  }, [translateY, backdropOpacity]);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.get(),
  }));

  const modalStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.get() }],
  }));

  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', e => {
      setKeyboardHeight(e.endCoordinates.height);
    });
    const hide = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardHeight(0);
    });
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  useEffect(() => {
    if (isVisible) {
      openModal();
    }
  }, [isVisible, openModal]);

  if (!isVisible) {
    return null;
  }

  return (
    <>
      <Animated.View style={[styles.backdrop as ViewStyle, backdropStyle]}>
        <Pressable style={{ flex: 1 }} onPress={closeModal} />
      </Animated.View>

      <Animated.View style={[styles.modalContainer as ViewStyle, modalStyle]}>
        <GestureDetector gesture={panGesture}>
          <View style={styles.handleContainer as ViewStyle}>
            <View style={styles.handle as ViewStyle} />
          </View>
        </GestureDetector>

        <View style={styles.header as ViewStyle}>
          <View style={styles.headerLeft as ViewStyle}>
            {showBackButton && (
              <Pressable
                style={({ pressed }) => [
                  styles.backButton as ViewStyle,
                  pressed && { opacity: 0.8 },
                ]}
                onPress={closeModal}
              >
                <MaterialIcons name="arrow-back" size={24} color={theme.colors.onSurfaceVariant} />
              </Pressable>
            )}
            <View>
              <Text style={styles.headerTitle as TextStyle}>{title}</Text>
              {subtitle && <Text style={styles.headerSubtitle as TextStyle}>{subtitle}</Text>}
            </View>
          </View>
        </View>

        <ScrollView
          style={styles.content as ViewStyle}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="always"
          contentContainerStyle={{ paddingBottom: keyboardHeight }}
        >
          {children}
        </ScrollView>
      </Animated.View>
    </>
  );
}
