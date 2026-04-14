import { View, Text, Pressable, type ViewStyle, type TextStyle } from 'react-native'
import { StyleSheet as RNStyleSheet } from 'react-native'
import { useAppTheme } from '../../styles/theme'
import { MaterialIcons } from '@expo/vector-icons'

interface TopAppBarProps {
  title: string
  leftLabel?: string
  onBackPress?: () => void
  showBackButton?: boolean
  variant?: 'transparent-blur' | 'solid-white'
}

export function TopAppBar({
  title,
  leftLabel,
  onBackPress,
  showBackButton = true,
  variant = 'transparent-blur',
}: TopAppBarProps) {
  const theme = useAppTheme()

  const getStyles = () => {
    const baseContainer = {
      height: 64,
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      justifyContent: 'space-between' as const,
      paddingHorizontal: 16,
      zIndex: 50,
    }

    const container =
      variant === 'transparent-blur'
        ? {
            ...baseContainer,
            position: 'absolute' as const,
            top: 0,
            left: 0,
            right: 0,
            backgroundColor: `${theme.colors.surfaceContainerLowest}CC`,
            backdropFilter: 'blur(20px)' as const,
          }
        : {
            ...baseContainer,
            position: 'relative' as const,
            backgroundColor: theme.colors.surfaceContainerLowest,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.surfaceContainer,
          }

    return RNStyleSheet.create({
      container,
      leftContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
      },
      backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.surfaceContainerLow,
      },
      title: {
        fontSize: 24,
        fontWeight: '800',
        color: theme.colors.primary,
      },
      leftLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.onSurfaceVariant,
      },
    })
  }

  const styles = getStyles()

  return (
    <View style={styles.container}>
      <View style={styles.leftContainer}>
        {showBackButton && (
          <Pressable style={styles.backButton} onPress={onBackPress}>
            <MaterialIcons name="arrow-back" size={24} color={theme.colors.onSurfaceVariant} />
          </Pressable>
        )}
        <Text style={styles.title}>{title}</Text>
      </View>
      {leftLabel && <Text style={styles.leftLabel}>{leftLabel}</Text>}
    </View>
  )
}
