import React from 'react';
import { View, ViewStyle, StyleSheet } from 'react-native';
import Svg, { Path, Circle, Rect, Line, G } from 'react-native-svg';
import { colors } from '../../config/theme';

// Nest Icon - The main logo icon
interface NestIconProps {
  size?: number;
  color?: string;
  accentColor?: string;
}

export function NestIcon({
  size = 48,
  color = colors.primary[500],
  accentColor = colors.accent[500],
}: NestIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      {/* Nest curves */}
      <Path
        d="M8 32C8 32 12 38 24 38C36 38 40 32 40 32"
        stroke={color}
        strokeWidth={3}
        strokeLinecap="round"
      />
      <Path
        d="M12 28C12 28 15 33 24 33C33 33 36 28 36 28"
        stroke={color}
        strokeWidth={2.5}
        strokeLinecap="round"
      />
      <Path
        d="M16 24.5C16 24.5 18.5 28.5 24 28.5C29.5 28.5 32 24.5 32 24.5"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
      {/* Roof */}
      <Path d="M24 8L38 20H10L24 8Z" fill={accentColor} />
      <Path
        d="M24 8L38 20H10L24 8Z"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Chimney */}
      <Rect x={30} y={11} width={4} height={6} fill={color} rx={1} />
    </Svg>
  );
}

// Nest Curves - Decorative background element
interface NestCurvesProps {
  width?: number;
  height?: number;
  color?: string;
  opacity?: number;
  style?: ViewStyle;
}

export function NestCurves({
  width = 400,
  height = 150,
  color = colors.accent[500],
  opacity = 0.15,
  style,
}: NestCurvesProps) {
  const aspectRatio = 400 / 150;
  const scaledHeight = width / aspectRatio;

  return (
    <View style={style}>
      <Svg
        width={width}
        height={height || scaledHeight}
        viewBox="0 0 400 150"
        fill="none"
      >
        <Path
          d="M0 150C0 150 80 80 200 80C320 80 400 150 400 150"
          stroke={color}
          strokeWidth={24}
          strokeLinecap="round"
          opacity={opacity}
        />
        <Path
          d="M40 150C40 150 100 100 200 100C300 100 360 150 360 150"
          stroke={color}
          strokeWidth={16}
          strokeLinecap="round"
          opacity={opacity * 0.8}
        />
        <Path
          d="M80 150C80 150 120 115 200 115C280 115 320 150 320 150"
          stroke={color}
          strokeWidth={10}
          strokeLinecap="round"
          opacity={opacity * 0.6}
        />
      </Svg>
    </View>
  );
}

// Corner Nest - For card corners or page decorations
interface CornerNestProps {
  size?: number;
  color?: string;
  position?: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right';
  style?: ViewStyle;
}

export function CornerNest({
  size = 120,
  color = colors.accent[500],
  position = 'bottom-left',
  style,
}: CornerNestProps) {
  const transforms: Record<string, { scaleX: number; scaleY: number }> = {
    'bottom-left': { scaleX: 1, scaleY: 1 },
    'bottom-right': { scaleX: -1, scaleY: 1 },
    'top-left': { scaleX: 1, scaleY: -1 },
    'top-right': { scaleX: -1, scaleY: -1 },
  };

  const transform = transforms[position];

  return (
    <View
      style={[
        style,
        {
          transform: [{ scaleX: transform.scaleX }, { scaleY: transform.scaleY }],
        },
      ]}
    >
      <Svg width={size} height={size} viewBox="0 0 120 120" fill="none">
        <Path
          d="M0 120C0 120 30 80 80 80C100 80 120 90 120 90"
          stroke={color}
          strokeWidth={6}
          strokeLinecap="round"
          opacity={0.3}
        />
        <Path
          d="M0 120C0 120 25 95 65 95C85 95 100 100 100 100"
          stroke={color}
          strokeWidth={4}
          strokeLinecap="round"
          opacity={0.2}
        />
        <Path
          d="M0 120C0 120 20 108 50 108C65 108 80 112 80 112"
          stroke={color}
          strokeWidth={3}
          strokeLinecap="round"
          opacity={0.15}
        />
      </Svg>
    </View>
  );
}

// Radial Nest - Circular pattern
interface RadialNestProps {
  size?: number;
  color?: string;
  opacity?: number;
  style?: ViewStyle;
}

export function RadialNest({
  size = 200,
  color = colors.accent[500],
  opacity = 0.15,
  style,
}: RadialNestProps) {
  return (
    <View style={style}>
      <Svg width={size} height={size} viewBox="0 0 200 200" fill="none">
        <Circle
          cx={100}
          cy={100}
          r={90}
          stroke={color}
          strokeWidth={4}
          opacity={opacity}
        />
        <Circle
          cx={100}
          cy={100}
          r={70}
          stroke={color}
          strokeWidth={3}
          opacity={opacity * 0.8}
        />
        <Circle
          cx={100}
          cy={100}
          r={50}
          stroke={color}
          strokeWidth={2.5}
          opacity={opacity * 0.6}
        />
        <Circle
          cx={100}
          cy={100}
          r={32}
          stroke={color}
          strokeWidth={2}
          opacity={opacity * 0.4}
        />
      </Svg>
    </View>
  );
}

// Twig Accent - Organic decorative element
interface TwigAccentProps {
  width?: number;
  color?: string;
  opacity?: number;
  style?: ViewStyle;
}

export function TwigAccent({
  width = 120,
  color = colors.primary[500],
  opacity = 0.2,
  style,
}: TwigAccentProps) {
  const height = width * 0.5;

  return (
    <View style={style}>
      <Svg width={width} height={height} viewBox="0 0 120 60" fill="none">
        <Path
          d="M10 50C30 50 40 30 60 30C80 30 90 50 110 50"
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
          opacity={opacity}
        />
        <Path
          d="M40 30C40 30 35 20 45 15"
          stroke={color}
          strokeWidth={1.5}
          strokeLinecap="round"
          opacity={opacity * 0.8}
        />
        <Path
          d="M60 30C60 30 60 18 70 12"
          stroke={color}
          strokeWidth={1.5}
          strokeLinecap="round"
          opacity={opacity * 0.8}
        />
        <Path
          d="M80 35C80 35 85 25 78 18"
          stroke={color}
          strokeWidth={1.5}
          strokeLinecap="round"
          opacity={opacity * 0.8}
        />
      </Svg>
    </View>
  );
}

// Leaf Shape - Nature-inspired accent
interface LeafShapeProps {
  size?: number;
  color?: string;
  opacity?: number;
  rotation?: number;
  style?: ViewStyle;
}

export function LeafShape({
  size = 60,
  color = colors.primary[500],
  opacity = 0.15,
  rotation = 0,
  style,
}: LeafShapeProps) {
  return (
    <View style={[style, { transform: [{ rotate: `${rotation}deg` }] }]}>
      <Svg width={size} height={size} viewBox="0 0 60 60" fill="none">
        <Path
          d="M30 5C30 5 50 20 50 40C50 50 40 55 30 55C20 55 10 50 10 40C10 20 30 5 30 5Z"
          fill={color}
          opacity={opacity}
        />
        <Path
          d="M30 15V45"
          stroke={color}
          strokeWidth={1}
          opacity={opacity * 1.5}
        />
        <Path
          d="M30 25L22 32"
          stroke={color}
          strokeWidth={0.75}
          opacity={opacity * 1.5}
        />
        <Path
          d="M30 32L38 38"
          stroke={color}
          strokeWidth={0.75}
          opacity={opacity * 1.5}
        />
      </Svg>
    </View>
  );
}

// Dot Pattern - Subtle background pattern
interface DotPatternProps {
  width?: number;
  height?: number;
  color?: string;
  opacity?: number;
  style?: ViewStyle;
}

export function DotPattern({
  width = 200,
  height = 200,
  color = colors.primary[500],
  opacity = 0.1,
  style,
}: DotPatternProps) {
  const dots = [];
  for (let row = 0; row < 10; row++) {
    for (let col = 0; col < 10; col++) {
      dots.push(
        <Circle
          key={`${row}-${col}`}
          cx={10 + col * 20}
          cy={10 + row * 20}
          r={2}
          fill={color}
          opacity={opacity}
        />
      );
    }
  }

  return (
    <View style={style}>
      <Svg width={width} height={height} viewBox="0 0 200 200" fill="none">
        {dots}
      </Svg>
    </View>
  );
}

// Wave Divider - Section separator
interface WaveDividerProps {
  width?: number;
  color?: string;
  style?: ViewStyle;
}

export function WaveDivider({
  width = 400,
  color = colors.cream,
  style,
}: WaveDividerProps) {
  return (
    <View style={style}>
      <Svg
        width={width}
        height={60}
        viewBox="0 0 800 60"
        fill="none"
        preserveAspectRatio="none"
      >
        <Path
          d="M0 30C133 60 267 0 400 30C533 60 667 0 800 30V60H0V30Z"
          fill={color}
        />
      </Svg>
    </View>
  );
}

// Layered Waves - Decorative bottom element
interface LayeredWavesProps {
  width?: number;
  height?: number;
  color?: string;
  style?: ViewStyle;
}

export function LayeredWaves({
  width = 400,
  height = 120,
  color = colors.accent[500],
  style,
}: LayeredWavesProps) {
  return (
    <View style={style}>
      <Svg
        width={width}
        height={height}
        viewBox="0 0 400 120"
        fill="none"
        preserveAspectRatio="none"
      >
        <Path
          d="M0 80C100 100 150 60 200 70C250 80 300 100 400 80V120H0V80Z"
          fill={color}
          opacity={0.1}
        />
        <Path
          d="M0 90C80 70 160 100 240 85C320 70 360 90 400 85V120H0V90Z"
          fill={color}
          opacity={0.15}
        />
        <Path
          d="M0 100C60 95 120 105 200 100C280 95 340 105 400 100V120H0V100Z"
          fill={color}
          opacity={0.2}
        />
      </Svg>
    </View>
  );
}

// Abstract House - Simplified house shape
interface AbstractHouseProps {
  size?: number;
  color?: string;
  accentColor?: string;
  opacity?: number;
  style?: ViewStyle;
}

export function AbstractHouse({
  size = 80,
  color = colors.primary[500],
  accentColor = colors.accent[500],
  opacity = 0.2,
  style,
}: AbstractHouseProps) {
  return (
    <View style={style}>
      <Svg width={size} height={size} viewBox="0 0 80 80" fill="none">
        <Path
          d="M40 10L70 35V70H10V35L40 10Z"
          stroke={color}
          strokeWidth={2}
          opacity={opacity}
          fill="none"
        />
        <Path
          d="M40 10L70 35H10L40 10Z"
          fill={accentColor}
          opacity={opacity * 0.8}
        />
        <Rect
          x={32}
          y={45}
          width={16}
          height={25}
          stroke={color}
          strokeWidth={1.5}
          opacity={opacity}
          fill="none"
        />
      </Svg>
    </View>
  );
}

// Badge Seal - Achievement/milestone indicator
interface BadgeSealProps {
  size?: number;
  color?: string;
  accentColor?: string;
  style?: ViewStyle;
}

export function BadgeSeal({
  size = 100,
  color = colors.primary[500],
  accentColor = colors.accent[500],
  style,
}: BadgeSealProps) {
  return (
    <View style={style}>
      <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
        <Circle cx={50} cy={50} r={40} fill={accentColor} opacity={0.15} />
        <Circle
          cx={50}
          cy={50}
          r={35}
          stroke={color}
          strokeWidth={2}
          fill="none"
          opacity={0.3}
        />
        <Circle
          cx={50}
          cy={50}
          r={28}
          stroke={color}
          strokeWidth={1}
          fill="none"
          opacity={0.2}
        />
        <Path
          d="M50 25L53 40L68 40L56 49L60 64L50 55L40 64L44 49L32 40L47 40L50 25Z"
          fill={color}
          opacity={0.25}
        />
      </Svg>
    </View>
  );
}

export default {
  NestIcon,
  NestCurves,
  CornerNest,
  RadialNest,
  TwigAccent,
  LeafShape,
  DotPattern,
  WaveDivider,
  LayeredWaves,
  AbstractHouse,
  BadgeSeal,
};
