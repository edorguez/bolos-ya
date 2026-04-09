import { View, Text, Pressable, type ViewStyle, type TextStyle } from 'react-native'
import { StyleSheet } from '../../styles/createStyleSheet'
import { useAppTheme } from '../../styles/theme'
// @ts-ignore
import MaterialIcons from '@expo/vector-icons/build/MaterialIcons'

interface TopAppBarProps {
  title: string
  leftLabel?: string
  onBackPress?: () => void
  showBackButton?: boolean
}

const stylesheet = StyleSheet.create(theme => ({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 64,
    backgroundColor: `${theme.colors.surfaceContainerLowest}CC`,
    backdropFilter: 'blur(20px)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    zIndex: 50,
  },
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
}))

export function TopAppBar({
  title,
  leftLabel,
  onBackPress,
  showBackButton = true,
}: TopAppBarProps) {
  const theme = useAppTheme()
  const styles = stylesheet(theme)

  return (
    <View style={styles.container as ViewStyle}>
      <View style={styles.leftContainer as ViewStyle}>
        {showBackButton && (
          <Pressable style={styles.backButton as ViewStyle} onPress={onBackPress}>
            <MaterialIcons name="arrow_back" size={24} color={theme.colors.onSurfaceVariant} />
          </Pressable>
        )}
        <Text style={styles.title as TextStyle}>{title}</Text>
      </View>
      {leftLabel && <Text style={styles.leftLabel as TextStyle}>{leftLabel}</Text>}
    </View>
  )
}
