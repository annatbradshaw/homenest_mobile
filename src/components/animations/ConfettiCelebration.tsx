import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { colors } from '../../config/theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ConfettiPiece {
  id: number;
  x: number;
  delay: number;
  color: string;
  size: number;
  rotation: number;
  type: 'rect' | 'circle';
}

interface ConfettiCelebrationProps {
  visible: boolean;
  onComplete?: () => void;
  duration?: number;
  pieceCount?: number;
}

// Brandbook colors for confetti
const CONFETTI_COLORS = [
  colors.primary[500],    // Forest green
  colors.accent[500],     // Terracotta
  colors.primary[400],    // Forest light
  colors.accent[400],     // Terracotta light
  colors.success[500],    // Success green
];

function ConfettiPieceComponent({
  piece,
  duration,
}: {
  piece: ConfettiPiece;
  duration: number;
}) {
  const translateY = useSharedValue(-50);
  const translateX = useSharedValue(0);
  const rotate = useSharedValue(0);
  const opacity = useSharedValue(1);

  useEffect(() => {
    // Random horizontal sway
    const swayAmount = (Math.random() - 0.5) * 100;

    translateY.value = withDelay(
      piece.delay,
      withTiming(SCREEN_HEIGHT + 100, {
        duration: duration,
        easing: Easing.out(Easing.quad),
      })
    );

    translateX.value = withDelay(
      piece.delay,
      withSequence(
        withTiming(swayAmount, { duration: duration * 0.25 }),
        withTiming(-swayAmount * 0.5, { duration: duration * 0.25 }),
        withTiming(swayAmount * 0.3, { duration: duration * 0.25 }),
        withTiming(0, { duration: duration * 0.25 })
      )
    );

    rotate.value = withDelay(
      piece.delay,
      withTiming(piece.rotation + 720, {
        duration: duration,
        easing: Easing.linear,
      })
    );

    opacity.value = withDelay(
      piece.delay + duration * 0.7,
      withTiming(0, { duration: duration * 0.3 })
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${rotate.value}deg` },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.piece,
        animatedStyle,
        {
          left: piece.x,
          width: piece.size,
          height: piece.type === 'rect' ? piece.size : piece.size,
          backgroundColor: piece.color,
          borderRadius: piece.type === 'circle' ? piece.size / 2 : 2,
        },
      ]}
    />
  );
}

export function ConfettiCelebration({
  visible,
  onComplete,
  duration = 2500,
  pieceCount = 50,
}: ConfettiCelebrationProps) {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (visible && !isAnimating) {
      setIsAnimating(true);

      // Generate confetti pieces
      const newPieces: ConfettiPiece[] = Array.from({ length: pieceCount }, (_, i) => ({
        id: i,
        x: Math.random() * SCREEN_WIDTH,
        delay: Math.random() * 300,
        color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        size: 6 + Math.random() * 8,
        rotation: Math.random() * 360,
        type: Math.random() > 0.5 ? 'rect' : 'circle',
      }));

      setPieces(newPieces);

      // Cleanup after animation
      const timer = setTimeout(() => {
        setIsAnimating(false);
        setPieces([]);
        onComplete?.();
      }, duration + 500);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  if (!isAnimating || pieces.length === 0) {
    return null;
  }

  return (
    <View style={styles.container} pointerEvents="none">
      {pieces.map((piece) => (
        <ConfettiPieceComponent
          key={piece.id}
          piece={piece}
          duration={duration}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
    pointerEvents: 'none',
  },
  piece: {
    position: 'absolute',
    top: 0,
  },
});

export default ConfettiCelebration;
