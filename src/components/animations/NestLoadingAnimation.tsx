import React, { useEffect } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { colors, typography, spacing } from '../../config/theme';

interface NestLoadingAnimationProps {
  size?: number;
  color?: string;
  accentColor?: string;
  message?: string;
  showMessage?: boolean;
}

// Animated SVG path component
const AnimatedPath = Animated.createAnimatedComponent(Path);

export function NestLoadingAnimation({
  size = 64,
  color = colors.primary[500],
  accentColor = colors.accent[500],
  message = 'Loading...',
  showMessage = true,
}: NestLoadingAnimationProps) {
  // Animation values for each nest curve
  const curve1Opacity = useSharedValue(0.3);
  const curve2Opacity = useSharedValue(0.3);
  const curve3Opacity = useSharedValue(0.3);
  const roofProgress = useSharedValue(0);

  useEffect(() => {
    // Staggered wave animation for nest curves
    curve1Opacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 600, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.3, { duration: 600, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );

    curve2Opacity.value = withDelay(
      200,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 600, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.3, { duration: 600, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      )
    );

    curve3Opacity.value = withDelay(
      400,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 600, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.3, { duration: 600, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      )
    );

    // Gentle breathing animation for roof
    roofProgress.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 1500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
  }, []);

  const curve1Style = useAnimatedStyle(() => ({
    opacity: curve1Opacity.value,
  }));

  const curve2Style = useAnimatedStyle(() => ({
    opacity: curve2Opacity.value,
  }));

  const curve3Style = useAnimatedStyle(() => ({
    opacity: curve3Opacity.value,
  }));

  const roofStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: interpolate(roofProgress.value, [0, 1], [1, 1.02]) },
    ],
    opacity: interpolate(roofProgress.value, [0, 1], [0.9, 1]),
  }));

  const scale = size / 48;

  return (
    <View style={styles.container}>
      <View style={[styles.iconContainer, { width: size, height: size }]}>
        <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
          {/* Nest curves - bottom to top */}
          <Animated.View style={curve1Style}>
            <Svg width={size} height={size} viewBox="0 0 48 48" fill="none" style={StyleSheet.absoluteFill}>
              <Path
                d="M8 32C8 32 12 38 24 38C36 38 40 32 40 32"
                stroke={color}
                strokeWidth={3 / scale}
                strokeLinecap="round"
              />
            </Svg>
          </Animated.View>

          <Animated.View style={curve2Style}>
            <Svg width={size} height={size} viewBox="0 0 48 48" fill="none" style={StyleSheet.absoluteFill}>
              <Path
                d="M12 28C12 28 15 33 24 33C33 33 36 28 36 28"
                stroke={color}
                strokeWidth={2.5 / scale}
                strokeLinecap="round"
              />
            </Svg>
          </Animated.View>

          <Animated.View style={curve3Style}>
            <Svg width={size} height={size} viewBox="0 0 48 48" fill="none" style={StyleSheet.absoluteFill}>
              <Path
                d="M16 24.5C16 24.5 18.5 28.5 24 28.5C29.5 28.5 32 24.5 32 24.5"
                stroke={color}
                strokeWidth={2 / scale}
                strokeLinecap="round"
              />
            </Svg>
          </Animated.View>

          {/* Roof with breathing animation */}
          <Animated.View style={[StyleSheet.absoluteFill, roofStyle]}>
            <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
              <Path d="M24 8L38 20H10L24 8Z" fill={accentColor} />
              <Path
                d="M24 8L38 20H10L24 8Z"
                stroke={color}
                strokeWidth={2 / scale}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Chimney */}
              <Path
                d={`M30 11L30 17L34 17L34 11`}
                fill={color}
              />
            </Svg>
          </Animated.View>
        </Svg>
      </View>

      {showMessage && (
        <Text style={styles.message}>{message}</Text>
      )}
    </View>
  );
}

// Simple dots loading animation
export function DotsLoadingAnimation({
  color = colors.primary[500],
  size = 8,
}: {
  color?: string;
  size?: number;
}) {
  const dot1 = useSharedValue(0);
  const dot2 = useSharedValue(0);
  const dot3 = useSharedValue(0);

  useEffect(() => {
    const duration = 400;

    dot1.value = withRepeat(
      withSequence(
        withTiming(1, { duration }),
        withTiming(0, { duration })
      ),
      -1,
      false
    );

    dot2.value = withDelay(
      133,
      withRepeat(
        withSequence(
          withTiming(1, { duration }),
          withTiming(0, { duration })
        ),
        -1,
        false
      )
    );

    dot3.value = withDelay(
      266,
      withRepeat(
        withSequence(
          withTiming(1, { duration }),
          withTiming(0, { duration })
        ),
        -1,
        false
      )
    );
  }, []);

  const dot1Style = useAnimatedStyle(() => ({
    opacity: interpolate(dot1.value, [0, 1], [0.3, 1]),
    transform: [{ scale: interpolate(dot1.value, [0, 1], [0.8, 1.2]) }],
  }));

  const dot2Style = useAnimatedStyle(() => ({
    opacity: interpolate(dot2.value, [0, 1], [0.3, 1]),
    transform: [{ scale: interpolate(dot2.value, [0, 1], [0.8, 1.2]) }],
  }));

  const dot3Style = useAnimatedStyle(() => ({
    opacity: interpolate(dot3.value, [0, 1], [0.3, 1]),
    transform: [{ scale: interpolate(dot3.value, [0, 1], [0.8, 1.2]) }],
  }));

  return (
    <View style={styles.dotsContainer}>
      <Animated.View
        style={[
          styles.dot,
          dot1Style,
          { width: size, height: size, borderRadius: size / 2, backgroundColor: color },
        ]}
      />
      <Animated.View
        style={[
          styles.dot,
          dot2Style,
          { width: size, height: size, borderRadius: size / 2, backgroundColor: color },
        ]}
      />
      <Animated.View
        style={[
          styles.dot,
          dot3Style,
          { width: size, height: size, borderRadius: size / 2, backgroundColor: color },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[3],
  },
  iconContainer: {
    position: 'relative',
  },
  message: {
    fontSize: typography.fontSize.sm,
    color: colors.neutral[500],
    fontWeight: typography.fontWeight.medium,
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  dot: {
    // Size set inline
  },
});

export default NestLoadingAnimation;
