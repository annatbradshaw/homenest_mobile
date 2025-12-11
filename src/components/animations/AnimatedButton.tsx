import React, { useCallback } from 'react';
import { ViewStyle, Pressable, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
} from 'react-native-reanimated';

interface AnimatedButtonProps {
  children: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  style?: ViewStyle;
  pressScale?: number;
  haptic?: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function AnimatedButton({
  children,
  onPress,
  disabled = false,
  style,
  pressScale = 0.97,
}: AnimatedButtonProps) {
  const pressed = useSharedValue(0);

  const handlePressIn = useCallback(() => {
    if (disabled) return;
    pressed.value = withSpring(1, { damping: 15, stiffness: 400 });
  }, [disabled]);

  const handlePressOut = useCallback(() => {
    pressed.value = withSpring(0, { damping: 15, stiffness: 400 });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: interpolate(pressed.value, [0, 1], [1, pressScale]) },
    ],
    opacity: interpolate(pressed.value, [0, 1], [1, 0.9]),
  }));

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      style={[animatedStyle, style]}
    >
      {children}
    </AnimatedPressable>
  );
}

// Ripple effect button variant
interface RippleButtonProps {
  children: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  style?: ViewStyle;
  rippleColor?: string;
}

export function RippleButton({
  children,
  onPress,
  disabled = false,
  style,
}: RippleButtonProps) {
  const scale = useSharedValue(1);
  const rippleOpacity = useSharedValue(0);
  const rippleScale = useSharedValue(0.8);

  const handlePressIn = useCallback(() => {
    if (disabled) return;
    scale.value = withSpring(0.98, { damping: 15, stiffness: 400 });
    rippleOpacity.value = withTiming(0.15, { duration: 100 });
    rippleScale.value = withSpring(1.5, { damping: 10, stiffness: 200 });
  }, [disabled]);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
    rippleOpacity.value = withTiming(0, { duration: 200 });
    rippleScale.value = withTiming(0.8, { duration: 300 });
  }, []);

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const rippleStyle = useAnimatedStyle(() => ({
    opacity: rippleOpacity.value,
    transform: [{ scale: rippleScale.value }],
  }));

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      style={[styles.rippleContainer, containerStyle, style]}
    >
      <Animated.View style={[styles.ripple, rippleStyle]} />
      {children}
    </AnimatedPressable>
  );
}

// Bounce button for celebratory actions
interface BounceButtonProps {
  children: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  style?: ViewStyle;
}

export function BounceButton({
  children,
  onPress,
  disabled = false,
  style,
}: BounceButtonProps) {
  const scale = useSharedValue(1);

  const handlePress = useCallback(() => {
    if (disabled) return;
    // Bounce animation sequence
    scale.value = withSpring(0.9, { damping: 5, stiffness: 400 }, () => {
      scale.value = withSpring(1.05, { damping: 3, stiffness: 300 }, () => {
        scale.value = withSpring(1, { damping: 10, stiffness: 400 });
      });
    });
    onPress?.();
  }, [disabled, onPress]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPress={handlePress}
      disabled={disabled}
      style={[animatedStyle, style]}
    >
      {children}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  rippleContainer: {
    overflow: 'hidden',
    position: 'relative',
  },
  ripple: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'white',
    borderRadius: 100,
  },
});

export default AnimatedButton;
