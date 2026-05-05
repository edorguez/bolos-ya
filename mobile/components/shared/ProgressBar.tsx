import { View, ViewProps, type ViewStyle } from 'react-native'
import { StyleSheet } from '../../styles/createStyleSheet'
import { useAppTheme } from '../../styles/theme'

interface ProgressBarProps extends ViewProps {
  progress: number
  color?: string
  backgroundColor?: string
  height?: number
}

const stylesheet = StyleSheet.create(theme => ({
  container: {
    backgroundColor: theme.colors.surfaceContainer,
    borderRadius: theme.borderRadius.full,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: theme.borderRadius.full,
  },
}))

export function ProgressBar({
  progress,
  color,
  backgroundColor,
  height = 8,
  style,
  ...props
}: ProgressBarProps) {
  const theme = useAppTheme()
  const styles = stylesheet(theme)
  const fillColor = color || theme.colors.midnight

  return (
    <View style={[styles.container as ViewStyle, { height, backgroundColor }, style]} {...props}>
      <View
        style={[
          styles.fill as ViewStyle,
          {
            width: `${Math.min(Math.max(progress, 0), 100)}%`,
            backgroundColor: fillColor,
          },
        ]}
      />
    </View>
  )
}
