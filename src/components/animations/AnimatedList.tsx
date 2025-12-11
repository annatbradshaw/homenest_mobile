import React, { useEffect, useCallback } from 'react';
import { ViewStyle, FlatList, FlatListProps } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSpring,
  Easing,
  interpolate,
  FadeIn,
  FadeInDown,
  FadeInLeft,
  FadeInRight,
  Layout,
} from 'react-native-reanimated';
import { animation } from '../../config/theme';

// Stagger delay between items
const STAGGER_DELAY = 50;

interface AnimatedListItemProps {
  children: React.ReactNode;
  index: number;
  style?: ViewStyle;
  animationType?: 'fadeInUp' | 'fadeInLeft' | 'fadeInRight' | 'fadeInScale';
  staggerDelay?: number;
}

// Individual animated list item wrapper
export function AnimatedListItem({
  children,
  index,
  style,
  animationType = 'fadeInUp',
  staggerDelay = STAGGER_DELAY,
}: AnimatedListItemProps) {
  const progress = useSharedValue(0);
  const delay = index * staggerDelay;

  useEffect(() => {
    progress.value = withDelay(
      delay,
      withTiming(1, {
        duration: animation.duration.normal,
        easing: Easing.out(Easing.cubic),
      })
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    switch (animationType) {
      case 'fadeInLeft':
        return {
          opacity: progress.value,
          transform: [
            { translateX: interpolate(progress.value, [0, 1], [-20, 0]) },
          ],
        };
      case 'fadeInRight':
        return {
          opacity: progress.value,
          transform: [
            { translateX: interpolate(progress.value, [0, 1], [20, 0]) },
          ],
        };
      case 'fadeInScale':
        return {
          opacity: progress.value,
          transform: [
            { scale: interpolate(progress.value, [0, 1], [0.9, 1]) },
          ],
        };
      case 'fadeInUp':
      default:
        return {
          opacity: progress.value,
          transform: [
            { translateY: interpolate(progress.value, [0, 1], [20, 0]) },
          ],
        };
    }
  });

  return (
    <Animated.View style={[animatedStyle, style]}>
      {children}
    </Animated.View>
  );
}

// Hook for using with FlatList renderItem
export function useAnimatedListItem(
  index: number,
  options?: {
    animationType?: 'fadeInUp' | 'fadeInLeft' | 'fadeInRight' | 'fadeInScale';
    staggerDelay?: number;
  }
) {
  const { animationType = 'fadeInUp', staggerDelay = STAGGER_DELAY } = options || {};
  const progress = useSharedValue(0);
  const delay = index * staggerDelay;

  useEffect(() => {
    progress.value = withDelay(
      delay,
      withTiming(1, {
        duration: animation.duration.normal,
        easing: Easing.out(Easing.cubic),
      })
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    switch (animationType) {
      case 'fadeInLeft':
        return {
          opacity: progress.value,
          transform: [
            { translateX: interpolate(progress.value, [0, 1], [-20, 0]) },
          ],
        };
      case 'fadeInRight':
        return {
          opacity: progress.value,
          transform: [
            { translateX: interpolate(progress.value, [0, 1], [20, 0]) },
          ],
        };
      case 'fadeInScale':
        return {
          opacity: progress.value,
          transform: [
            { scale: interpolate(progress.value, [0, 1], [0.9, 1]) },
          ],
        };
      case 'fadeInUp':
      default:
        return {
          opacity: progress.value,
          transform: [
            { translateY: interpolate(progress.value, [0, 1], [20, 0]) },
          ],
        };
    }
  });

  return animatedStyle;
}

// Pre-built animated FlatList with staggered items
interface AnimatedListProps<T> extends Omit<FlatListProps<T>, 'renderItem'> {
  renderItem: (info: { item: T; index: number }) => React.ReactElement;
  animationType?: 'fadeInUp' | 'fadeInLeft' | 'fadeInRight' | 'fadeInScale';
  staggerDelay?: number;
}

export function AnimatedList<T>({
  renderItem,
  animationType = 'fadeInUp',
  staggerDelay = STAGGER_DELAY,
  ...flatListProps
}: AnimatedListProps<T>) {
  const animatedRenderItem = useCallback(
    ({ item, index }: { item: T; index: number }) => (
      <AnimatedListItem
        index={index}
        animationType={animationType}
        staggerDelay={staggerDelay}
      >
        {renderItem({ item, index })}
      </AnimatedListItem>
    ),
    [renderItem, animationType, staggerDelay]
  );

  return (
    <FlatList
      {...flatListProps}
      renderItem={animatedRenderItem}
    />
  );
}

// Reanimated's built-in entering animations for simpler use cases
export const enteringAnimations = {
  fadeIn: FadeIn.duration(animation.duration.normal),
  fadeInDown: FadeInDown.duration(animation.duration.normal).springify(),
  fadeInLeft: FadeInLeft.duration(animation.duration.normal).springify(),
  fadeInRight: FadeInRight.duration(animation.duration.normal).springify(),
};

// Layout animation for list item reordering
export const layoutAnimation = Layout.springify().damping(15);

export default AnimatedList;
