import React, { useEffect } from 'react';
import { StyleSheet, View, Text, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  withSpring,
  Easing,
  interpolate,
  runOnJS,
} from 'react-native-reanimated';
import Svg, { Path, Rect } from 'react-native-svg';
import { colors, typography } from '../config/theme';

const { width, height } = Dimensions.get('window');

interface AnimatedSplashProps {
  onAnimationComplete: () => void;
}

// Animated Nest Icon component
function AnimatedNestIcon({ size = 80 }: { size?: number }) {
  const curve1 = useSharedValue(0);
  const curve2 = useSharedValue(0);
  const curve3 = useSharedValue(0);
  const roof = useSharedValue(0);

  useEffect(() => {
    // Staggered animation for nest curves (bottom to top)
    curve1.value = withDelay(300, withSpring(1, { damping: 12, stiffness: 100 }));
    curve2.value = withDelay(450, withSpring(1, { damping: 12, stiffness: 100 }));
    curve3.value = withDelay(600, withSpring(1, { damping: 12, stiffness: 100 }));
    roof.value = withDelay(750, withSpring(1, { damping: 10, stiffness: 120 }));
  }, []);

  const curve1Style = useAnimatedStyle(() => ({
    opacity: curve1.value,
    transform: [{ translateY: interpolate(curve1.value, [0, 1], [10, 0]) }],
  }));

  const curve2Style = useAnimatedStyle(() => ({
    opacity: curve2.value,
    transform: [{ translateY: interpolate(curve2.value, [0, 1], [10, 0]) }],
  }));

  const curve3Style = useAnimatedStyle(() => ({
    opacity: curve3.value,
    transform: [{ translateY: interpolate(curve3.value, [0, 1], [10, 0]) }],
  }));

  const roofStyle = useAnimatedStyle(() => ({
    opacity: roof.value,
    transform: [
      { translateY: interpolate(roof.value, [0, 1], [-15, 0]) },
      { scale: interpolate(roof.value, [0, 1], [0.8, 1]) },
    ],
  }));

  return (
    <View style={{ width: size, height: size }}>
      {/* Nest curves - animated in from bottom */}
      <Animated.View style={[StyleSheet.absoluteFill, curve1Style]}>
        <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
          <Path
            d="M8 32C8 32 12 38 24 38C36 38 40 32 40 32"
            stroke={colors.primary[500]}
            strokeWidth={3}
            strokeLinecap="round"
          />
        </Svg>
      </Animated.View>

      <Animated.View style={[StyleSheet.absoluteFill, curve2Style]}>
        <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
          <Path
            d="M12 28C12 28 15 33 24 33C33 33 36 28 36 28"
            stroke={colors.primary[500]}
            strokeWidth={2.5}
            strokeLinecap="round"
          />
        </Svg>
      </Animated.View>

      <Animated.View style={[StyleSheet.absoluteFill, curve3Style]}>
        <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
          <Path
            d="M16 24.5C16 24.5 18.5 28.5 24 28.5C29.5 28.5 32 24.5 32 24.5"
            stroke={colors.primary[500]}
            strokeWidth={2}
            strokeLinecap="round"
          />
        </Svg>
      </Animated.View>

      {/* Roof - animated in from top */}
      <Animated.View style={[StyleSheet.absoluteFill, roofStyle]}>
        <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
          <Path d="M24 8L38 20H10L24 8Z" fill={colors.accent[500]} />
          <Path
            d="M24 8L38 20H10L24 8Z"
            stroke={colors.primary[500]}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Rect x={30} y={11} width={4} height={6} fill={colors.primary[500]} rx={1} />
        </Svg>
      </Animated.View>
    </View>
  );
}

export function AnimatedSplash({ onAnimationComplete }: AnimatedSplashProps) {
  const containerOpacity = useSharedValue(1);
  const textOpacity = useSharedValue(0);
  const textTranslateY = useSharedValue(20);

  useEffect(() => {
    // Animate text in after icon
    textOpacity.value = withDelay(
      900,
      withTiming(1, { duration: 400, easing: Easing.out(Easing.ease) })
    );
    textTranslateY.value = withDelay(
      900,
      withSpring(0, { damping: 15, stiffness: 100 })
    );

    // Fade out entire splash after animation completes
    const timeout = setTimeout(() => {
      containerOpacity.value = withTiming(0, { duration: 400 }, (finished) => {
        if (finished) {
          runOnJS(onAnimationComplete)();
        }
      });
    }, 2200);

    return () => clearTimeout(timeout);
  }, []);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: containerOpacity.value,
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: textTranslateY.value }],
  }));

  return (
    <Animated.View style={[styles.container, containerStyle]}>
      <View style={styles.content}>
        <AnimatedNestIcon size={100} />
        <Animated.Text style={[styles.title, textStyle]}>HomeNest</Animated.Text>
        <Animated.Text style={[styles.tagline, textStyle]}>
          Your renovation companion
        </Animated.Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
    backgroundColor: colors.warmWhite,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontFamily: typography.fontFamily.displayMedium,
    fontSize: 36,
    color: colors.primary[500],
    marginTop: 16,
    letterSpacing: -0.5,
  },
  tagline: {
    fontFamily: typography.fontFamily.body,
    fontSize: 16,
    color: colors.neutral[500],
    marginTop: 8,
  },
});
