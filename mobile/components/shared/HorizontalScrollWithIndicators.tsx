import {
  ScrollView,
  View,
  type ScrollViewProps,
  type ViewStyle,
  type TextStyle,
  type LayoutChangeEvent,
  type NativeSyntheticEvent,
  type NativeScrollEvent,
} from 'react-native';
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
    opacity: 0.1,
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

  const scrollViewRef = useRef<ScrollView>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [contentWidth, setContentWidth] = useState(0);
  const [scrollX, setScrollX] = useState(0);

  const handleContainerLayout = (event: LayoutChangeEvent) => {
    setContainerWidth(event.nativeEvent.layout.width);
  };

  const handleContentSizeChange = (width: number) => {
    setContentWidth(width);
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    setScrollX(event.nativeEvent.contentOffset.x);
  };

  const showLeftArrow = scrollX > 0;
  const showRightArrow =
    contentWidth > containerWidth && scrollX < contentWidth - containerWidth - 1;

  return (
    <View style={styles.container as ViewStyle}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        onLayout={handleContainerLayout}
        onContentSizeChange={handleContentSizeChange}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        {...scrollViewProps}
        style={[styles.scrollView as ViewStyle, scrollViewProps.style]}
      >
        {children}
      </ScrollView>

      {showLeftArrow && (
        <View
          style={[
            styles.arrowContainer as ViewStyle,
            styles.leftArrowContainer as ViewStyle,
            leftArrowStyle,
          ]}
          pointerEvents="none"
        >
          <View style={styles.arrowBackground as ViewStyle}>
            <MaterialIcons
              name={iconNameLeft as any}
              size={iconSize}
              style={styles.icon as TextStyle}
            />
          </View>
        </View>
      )}

      {showRightArrow && (
        <View
          style={[
            styles.arrowContainer as ViewStyle,
            styles.rightArrowContainer as ViewStyle,
            rightArrowStyle,
          ]}
          pointerEvents="none"
        >
          <View style={styles.arrowBackground as ViewStyle}>
            <MaterialIcons
              name={iconNameRight as any}
              size={iconSize}
              style={styles.icon as TextStyle}
            />
          </View>
        </View>
      )}
    </View>
  );
}
