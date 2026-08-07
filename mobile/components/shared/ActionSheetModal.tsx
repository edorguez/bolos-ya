import { View, Text, Pressable, Dimensions, type ViewStyle, type TextStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useEffect, useCallback, useMemo } from 'react';
import { StyleSheet } from '../../styles/createStyleSheet';
import { useAppTheme } from '../../styles/theme';
import { MaterialIcons } from '@expo/vector-icons';

interface ActionSheetOption {
  label: string;
  icon: string;
  color: string;
  onPress: () => void;
}

interface ActionSheetModalProps {
  isVisible: boolean;
  onClose: () => void;
  options: ActionSheetOption[];
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const MODAL_HEIGHT = SCREEN_HEIGHT * 0.2;

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
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
  },
  optionContainer: {
    flex: 1,
    justifyContent: 'center',
    gap: theme.spacing.md,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surfaceContainerLow,
  },
  optionIcon: {
    width: 24,
    alignItems: 'center',
  },
  optionLabel: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    flex: 1,
  },
}));

export function ActionSheetModal({ isVisible, onClose, options }: ActionSheetModalProps) {
  const theme = useAppTheme();
  const styles = stylesheet(theme);

  const translateY = useSharedValue(MODAL_HEIGHT);
  const backdropOpacity = useSharedValue(0);

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

        <View style={styles.content as ViewStyle}>
          <View style={styles.optionContainer as ViewStyle}>
            {options.map((option, index) => (
              <Pressable
                key={index}
                style={({ pressed }) => [
                  styles.optionButton as ViewStyle,
                  pressed && { opacity: 0.8 },
                ]}
                onPress={() => {
                  option.onPress();
                  closeModal();
                }}
              >
                <View style={styles.optionIcon as ViewStyle}>
                  <MaterialIcons
                    name={option.icon as keyof typeof MaterialIcons.glyphMap}
                    size={24}
                    color={option.color}
                  />
                </View>
                <Text style={[styles.optionLabel as TextStyle, { color: option.color }]}>
                  {option.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      </Animated.View>
    </>
  );
}
