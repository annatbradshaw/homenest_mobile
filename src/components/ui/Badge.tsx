import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { colors, borderRadius, typography, spacing } from '../../config/theme';

type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'accent';
type BadgeSize = 'sm' | 'md';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  size?: BadgeSize;
  style?: ViewStyle;
}

export function Badge({
  label,
  variant = 'default',
  size = 'md',
  style,
}: BadgeProps) {
  return (
    <View style={[styles.base, styles[variant], styles[`${size}Size`], style]}>
      <Text style={[styles.text, styles[`${variant}Text`], styles[`${size}Text`]]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    alignSelf: 'flex-start',
    borderRadius: borderRadius.full,
  },

  // Variants
  default: {
    backgroundColor: colors.neutral[100],
  },
  primary: {
    backgroundColor: colors.primary[100],
  },
  success: {
    backgroundColor: colors.success[100],
  },
  warning: {
    backgroundColor: colors.warning[100],
  },
  danger: {
    backgroundColor: colors.danger[100],
  },
  accent: {
    backgroundColor: colors.accent[100],
  },

  // Sizes
  smSize: {
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[0.5],
  },
  mdSize: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
  },

  // Text styles
  text: {
    fontWeight: typography.fontWeight.medium,
  },
  defaultText: {
    color: colors.neutral[700],
  },
  primaryText: {
    color: colors.primary[700],
  },
  successText: {
    color: colors.success[700],
  },
  warningText: {
    color: colors.warning[700],
  },
  dangerText: {
    color: colors.danger[700],
  },
  accentText: {
    color: colors.accent[700],
  },

  // Text sizes
  smText: {
    fontSize: typography.fontSize.xs,
  },
  mdText: {
    fontSize: typography.fontSize.sm,
  },
});

export default Badge;
