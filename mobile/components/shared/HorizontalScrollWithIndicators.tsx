import {
  View,
  type ScrollViewProps,
  type ViewStyle,
  type TextStyle,
  type LayoutChangeEvent,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { useState, useRef } from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { StyleSheet } from '../../styles/createStyleSheet';
import { useAppTheme } from '../../styles/theme';

interface HorizontalScrollWithIndicatorsProps extends Omit<ScrollViewProps, 'horizontal'> {
  children: React.ReactNode;
  leftArrowStyle?: ViewStyle;
  rightArrowStyle?: ViewStyle;
  iconNameLeft?: string;
  iconNameRight?: string;
  iconSize?: number;
}

const stylesheet = StyleSheet.create(theme => ({
  container: {
    position: 'relative',
  },
  scrollView: {
    flexGrow: 0,
  },
  arrowContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    pointerEvents: 'none',
    zIndex: 1,
  },
  leftArrowContainer: {
    left: 0,
    paddingLeft: theme.spacing.xs,
  },
  rightArrowContainer: {
    right: 0,
    paddingRight: theme.spacing.xs,
  },
  arrowBackground: {
    backgroundColor: theme.colors.midnight,
    borderRadius: theme.borderRadius.full,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    opacity: 1,
    color: 'white',
  },
}));

export function HorizontalScrollWithIndicators({
  children,
  leftArrowStyle,
  rightArrowStyle,
  iconNameLeft = 'chevron-left',
  iconNameRight = 'chevron-right',
  iconSize = 24,
  ...scrollViewProps
}: HorizontalScrollWithIndicatorsProps) {
  const theme = useAppTheme();
  const styles = stylesheet(theme);

  const scrollViewRef = useRef<Animated.ScrollView>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [contentWidth, setContentWidth] = useState(0);
  const scrollX = useSharedValue(0);

  const handleContainerLayout = (event: LayoutChangeEvent) => {
    setContainerWidth(event.nativeEvent.layout.width);
  };

  const handleContentSizeChange = (width: number) => {
    setContentWidth(width);
  };

  const onScroll = useAnimatedScrollHandler(event => {
    scrollX.set(event.contentOffset.x);
  });

  const canScroll = contentWidth > containerWidth;

  const leftArrowAnimatedStyle = useAnimatedStyle(() => ({
    opacity: withTiming(canScroll && scrollX.get() > 0 ? 1 : 0, { duration: 150 }),
  }));

  const rightArrowAnimatedStyle = useAnimatedStyle(() => ({
    opacity: withTiming(canScroll && scrollX.get() < contentWidth - containerWidth - 1 ? 1 : 0, {
      duration: 150,
    }),
  }));

  return (
    <View style={styles.container as ViewStyle}>
      <Animated.ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        onLayout={handleContainerLayout}
        onContentSizeChange={handleContentSizeChange}
        onScroll={onScroll}
        {...scrollViewProps}
        style={[styles.scrollView as ViewStyle, scrollViewProps.style]}
      >
        {children}
      </Animated.ScrollView>

      <Animated.View
        style={[
          styles.arrowContainer as ViewStyle,
          styles.leftArrowContainer as ViewStyle,
          leftArrowAnimatedStyle,
          leftArrowStyle,
        ]}
        pointerEvents="none"
      >
        <View style={styles.arrowBackground as ViewStyle}>
          <MaterialIcons
            name={iconNameLeft as keyof typeof MaterialIcons.glyphMap}
            size={iconSize}
            style={styles.icon as TextStyle}
          />
        </View>
      </Animated.View>

      <Animated.View
        style={[
          styles.arrowContainer as ViewStyle,
          styles.rightArrowContainer as ViewStyle,
          rightArrowAnimatedStyle,
          rightArrowStyle,
        ]}
        pointerEvents="none"
      >
        <View style={styles.arrowBackground as ViewStyle}>
          <MaterialIcons
            name={iconNameRight as keyof typeof MaterialIcons.glyphMap}
            size={iconSize}
            style={styles.icon as TextStyle}
          />
        </View>
      </Animated.View>
    </View>
  );
}
