import React, { useEffect } from 'react';
import { ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  withSpring,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import { animation } from '../../config/theme';

interface ContinuousAnimationProps {
  children: React.ReactNode;
  style?: ViewStyle;
  paused?: boolean;
}

// Floating animation - gentle up and down movement
// Good for decorative elements, background shapes
export function FloatingElement({
  children,
  style,
  paused = false,
  duration = 4000,
  distance = 10,
}: ContinuousAnimationProps & { duration?: number; distance?: number }) {
  const translateY = useSharedValue(0);

  useEffect(() => {
    if (!paused) {
      translateY.value = withRepeat(
        withSequence(
          withTiming(-distance, {
            duration: duration / 2,
            easing: Easing.inOut(Easing.ease),
          }),
          withTiming(0, {
            duration: duration / 2,
            easing: Easing.inOut(Easing.ease),
          })
        ),
        -1,
        false
      );
    } else {
      translateY.value = withTiming(0, { duration: 300 });
    }
  }, [paused, duration, distance]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={[animatedStyle, style]}>
      {children}
    </Animated.View>
  );
}

// Slow floating with horizontal movement
// Good for background decorations
export function FloatingElementSlow({
  children,
  style,
  paused = false,
}: ContinuousAnimationProps) {
  const progress = useSharedValue(0);

  useEffect(() => {
    if (!paused) {
      progress.value = withRepeat(
        withTiming(1, {
          duration: 6000,
          easing: Easing.inOut(Easing.ease),
        }),
        -1,
        true
      );
    } else {
      progress.value = withTiming(0, { duration: 300 });
    }
  }, [paused]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(progress.value, [0, 0.25, 0.5, 0.75, 1], [0, -8, -4, -12, 0]) },
      { translateX: interpolate(progress.value, [0, 0.25, 0.5, 0.75, 1], [0, 4, 8, 4, 0]) },
    ],
  }));

  return (
    <Animated.View style={[animatedStyle, style]}>
      {children}
    </Animated.View>
  );
}

// Breathing animation - subtle scale pulse
// Good for status indicators, focus elements
export function BreathingElement({
  children,
  style,
  paused = false,
  duration = 3000,
  minOpacity = 0.15,
  maxOpacity = 0.25,
}: ContinuousAnimationProps & {
  duration?: number;
  minOpacity?: number;
  maxOpacity?: number;
}) {
  const progress = useSharedValue(0);

  useEffect(() => {
    if (!paused) {
      progress.value = withRepeat(
        withSequence(
          withTiming(1, {
            duration: duration / 2,
            easing: Easing.inOut(Easing.ease),
          }),
          withTiming(0, {
            duration: duration / 2,
            easing: Easing.inOut(Easing.ease),
          })
        ),
        -1,
        false
      );
    } else {
      progress.value = withTiming(0, { duration: 300 });
    }
  }, [paused, duration]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: interpolate(progress.value, [0, 1], [1, 1.05]) },
    ],
    opacity: interpolate(progress.value, [0, 1], [minOpacity, maxOpacity]),
  }));

  return (
    <Animated.View style={[animatedStyle, style]}>
      {children}
    </Animated.View>
  );
}

// Pulse animation - opacity only
// Good for loading states, notifications
export function PulsingElement({
  children,
  style,
  paused = false,
  duration = 1500,
}: ContinuousAnimationProps & { duration?: number }) {
  const opacity = useSharedValue(1);

  useEffect(() => {
    if (!paused) {
      opacity.value = withRepeat(
        withSequence(
          withTiming(0.6, {
            duration: duration / 2,
            easing: Easing.inOut(Easing.ease),
          }),
          withTiming(1, {
            duration: duration / 2,
            easing: Easing.inOut(Easing.ease),
          })
        ),
        -1,
        false
      );
    } else {
      opacity.value = withTiming(1, { duration: 200 });
    }
  }, [paused, duration]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[animatedStyle, style]}>
      {children}
    </Animated.View>
  );
}

// Gentle spin animation
// Good for loading indicators
export function SpinningElement({
  children,
  style,
  paused = false,
  duration = 2000,
}: ContinuousAnimationProps & { duration?: number }) {
  const rotation = useSharedValue(0);

  useEffect(() => {
    if (!paused) {
      rotation.value = withRepeat(
        withTiming(360, {
          duration,
          easing: Easing.linear,
        }),
        -1,
        false
      );
    } else {
      rotation.value = withTiming(0, { duration: 300 });
    }
  }, [paused, duration]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <Animated.View style={[animatedStyle, style]}>
      {children}
    </Animated.View>
  );
}

// Sway animation - gentle rotation back and forth
// Good for celebratory elements, organic feel
export function SwayingElement({
  children,
  style,
  paused = false,
  duration = 2000,
  angle = 3,
}: ContinuousAnimationProps & { duration?: number; angle?: number }) {
  const rotation = useSharedValue(-angle);

  useEffect(() => {
    if (!paused) {
      rotation.value = withRepeat(
        withSequence(
          withTiming(angle, {
            duration: duration / 2,
            easing: Easing.inOut(Easing.ease),
          }),
          withTiming(-angle, {
            duration: duration / 2,
            easing: Easing.inOut(Easing.ease),
          })
        ),
        -1,
        false
      );
    } else {
      rotation.value = withTiming(0, { duration: 300 });
    }
  }, [paused, duration, angle]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <Animated.View style={[animatedStyle, style]}>
      {children}
    </Animated.View>
  );
}

// Wave animation - complex movement
// Good for water-like effects, organic backgrounds
export function WavingElement({
  children,
  style,
  paused = false,
}: ContinuousAnimationProps) {
  const progress = useSharedValue(0);

  useEffect(() => {
    if (!paused) {
      progress.value = withRepeat(
        withTiming(1, {
          duration: 3000,
          easing: Easing.linear,
        }),
        -1,
        false
      );
    } else {
      progress.value = withTiming(0, { duration: 300 });
    }
  }, [paused]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: interpolate(
          progress.value,
          [0, 0.25, 0.5, 0.75, 1],
          [0, -5, 0, 5, 0]
        ),
      },
      {
        rotate: `${interpolate(
          progress.value,
          [0, 0.25, 0.5, 0.75, 1],
          [0, 2, 0, -2, 0]
        )}deg`,
      },
    ],
  }));

  return (
    <Animated.View style={[animatedStyle, style]}>
      {children}
    </Animated.View>
  );
}

export default {
  FloatingElement,
  FloatingElementSlow,
  BreathingElement,
  PulsingElement,
  SpinningElement,
  SwayingElement,
  WavingElement,
};
