import { View, Text, Pressable, type ViewStyle } from 'react-native'
import { StyleSheet as RNStyleSheet } from 'react-native'
import { useAppTheme } from '../../styles/theme'
import { MaterialIcons } from '@expo/vector-icons'

interface TopAppBarProps {
  title: string
  rightLabel?: string
  onBackPress?: () => void
  showBackButton?: boolean
}

export function TopAppBar({
  title,
  rightLabel,
  onBackPress,
  showBackButton = true,
}: TopAppBarProps) {
  const theme = useAppTheme()

  const baseContainerStyle: ViewStyle = {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    zIndex: 50,
  }

  const styles = RNStyleSheet.create({
    container: {
      ...baseContainerStyle,
      position: 'relative',
      backgroundColor: theme.colors.surfaceContainerLowest,
    },
    leftContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      minWidth: 40,
    },
    backButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
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
      fontSize: 24,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.primary,
      textAlign: 'center',
    },
    rightContainer: {
      minWidth: 40,
      alignItems: 'flex-end',
    },
    rightLabel: {
      fontSize: 14,
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.onSurfaceVariant,
    },
  })

  return (
    <View style={styles.container}>
      <View style={styles.leftContainer}>
        {showBackButton && (
          <Pressable
            style={({ pressed }) => [styles.backButton, pressed && { opacity: 0.8 }]}
            onPress={onBackPress}
          >
            <MaterialIcons name="arrow-back" size={24} color={theme.colors.onSurfaceVariant} />
          </Pressable>
        )}
      </View>

      <View style={styles.centerContainer}>
        <Text style={styles.title}>{title}</Text>
      </View>

      <View style={styles.rightContainer}>
        {rightLabel && <Text style={styles.rightLabel}>{rightLabel}</Text>}
      </View>
    </View>
  )
}
