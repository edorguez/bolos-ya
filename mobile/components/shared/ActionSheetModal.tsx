import {
  View,
  Text,
  Pressable,
  Animated,
  Dimensions,
  PanResponder,
  type ViewStyle,
  type TextStyle,
} from 'react-native'
import { useEffect, useRef } from 'react'
import { StyleSheet } from '../../styles/createStyleSheet'
import { useAppTheme } from '../../styles/theme'
import { MaterialIcons } from '@expo/vector-icons'

interface ActionSheetOption {
  label: string
  icon: string
  color: string
  onPress: () => void
}

interface ActionSheetModalProps {
  isVisible: boolean
  onClose: () => void
  options: ActionSheetOption[]
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window')
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 70,
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
    fontWeight: theme.typography.fontWeight.bold,
    flex: 1,
  },
}))

export function ActionSheetModal({ isVisible, onClose, options }: ActionSheetModalProps) {
  const theme = useAppTheme()
  const styles = stylesheet(theme)

  const translateY = useRef(new Animated.Value(MODAL_HEIGHT)).current
  const backdropOpacity = useRef(new Animated.Value(0)).current

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return gestureState.dy > 5 // Only respond to downward gestures
      },
      onPanResponderMove: (_, gestureState) => {
        // Prevent moving above initial position and limit to MODAL_HEIGHT
        if (gestureState.dy > 0) {
          translateY.setValue(Math.min(gestureState.dy, MODAL_HEIGHT))
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        // If dragged down more than 100px or velocity is high, close modal
        if (gestureState.dy > 100 || gestureState.vy > 0.5) {
          closeModal()
        } else {
          // Snap back to top
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            tension: 50,
            friction: 10,
          }).start()
        }
      },
    })
  ).current

  const openModal = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 0.3,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start()
  }

  const closeModal = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: MODAL_HEIGHT,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose()
    })
  }

  useEffect(() => {
    if (isVisible) {
      openModal()
    }
  }, [isVisible])

  if (!isVisible) {
    return null
  }

  return (
    <>
      <Animated.View
        style={[
          styles.backdrop as ViewStyle,
          {
            opacity: backdropOpacity,
          },
        ]}
      >
        <Pressable style={{ flex: 1 }} onPress={closeModal} />
      </Animated.View>

      <Animated.View
        style={[
          styles.modalContainer as ViewStyle,
          {
            transform: [{ translateY }],
          },
        ]}
      >
        <View style={styles.handleContainer as ViewStyle} {...panResponder.panHandlers}>
          <View style={styles.handle as ViewStyle} />
        </View>

        <View style={styles.content as ViewStyle}>
          <View style={styles.optionContainer as ViewStyle}>
            {options.map((option, index) => (
              <Pressable
                key={index}
                style={({pressed}) => [styles.optionButton as ViewStyle, pressed && { opacity: 0.8 }]}
                onPress={() => {
                  option.onPress()
                  closeModal()
                }}
              >
                <View style={styles.optionIcon as ViewStyle}>
                  <MaterialIcons name={option.icon as any} size={24} color={option.color} />
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
  )
}
