import React from 'react';
import { View, Text, StyleSheet, TextStyle } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { colors, typography } from '../../config/theme';

interface CircularProgressProps {
  /** Progress value from 0-100. Alias for 'percentage' */
  progress?: number;
  /** @deprecated Use 'progress' instead */
  percentage?: number;
  size?: number;
  strokeWidth?: number;
  /** Color of the progress arc */
  progressColor?: string;
  /** @deprecated Use 'progressColor' instead */
  color?: string;
  /** Color of the background track */
  trackColor?: string;
  /** @deprecated Use 'trackColor' instead */
  backgroundColor?: string;
  /** Whether to show the percentage text */
  showPercentage?: boolean;
  /** @deprecated Use 'showPercentage' instead */
  showLabel?: boolean;
  /** Color of the percentage text */
  textColor?: string;
  /** Additional text styles */
  textStyle?: TextStyle;
}

export function CircularProgress({
  progress,
  percentage,
  size = 60,
  strokeWidth = 6,
  progressColor,
  color = colors.primary[500],
  trackColor,
  backgroundColor = colors.neutral[200],
  showPercentage,
  showLabel = true,
  textColor,
  textStyle,
}: CircularProgressProps) {
  // Support both 'progress' and 'percentage' prop names
  const value = progress ?? percentage ?? 0;
  // Ensure we have a valid number
  const safeValue = isNaN(value) ? 0 : Math.max(0, Math.min(100, value));

  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (safeValue / 100) * circumference;

  // Determine progress color - use explicit progressColor or fallback to color prop
  const finalProgressColor = progressColor ?? (
    safeValue >= 100 ? colors.success[500] :
    safeValue >= 50 ? color :
    colors.primary[500]
  );

  // Determine track color
  const finalTrackColor = trackColor ?? backgroundColor;

  // Determine whether to show label
  const shouldShowLabel = showPercentage ?? showLabel;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} style={styles.svg}>
        {/* Background circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={finalTrackColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={finalProgressColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      {shouldShowLabel && (
        <View style={styles.labelContainer}>
          <Text style={[
            styles.label,
            { fontSize: size * 0.25 },
            textColor && { color: textColor },
            textStyle,
          ]}>
            {Math.round(safeValue)}%
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  svg: {
    position: 'absolute',
  },
  labelContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontFamily: typography.fontFamily.displayBold,
    color: colors.charcoal,
  },
});

export default CircularProgress;
