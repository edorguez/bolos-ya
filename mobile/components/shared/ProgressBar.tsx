import { View, ViewProps } from 'react-native'
import { StyleSheet } from '../../styles/createStyleSheet'

interface ProgressBarProps extends ViewProps {
  progress: number // 0-100
  color?: string
  backgroundColor?: string
  height?: number
}

const stylesheet = StyleSheet.create(theme => ({
  container: {
    backgroundColor: theme.colors.surfaceContainerHighest,
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
  const fillColor = color

  return (
    <View style={[stylesheet.container, { height, backgroundColor }, style]} {...props}>
      <View
        style={[
          stylesheet.fill,
          {
            width: `${Math.min(Math.max(progress, 0), 100)}%`,
            backgroundColor: fillColor,
          },
        ]}
      />
    </View>
  )
}
