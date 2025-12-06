import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, borderRadius, typography, spacing } from '../../config/theme';
import { useTheme } from '../../stores/ThemeContext';

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
  const { isDark } = useTheme();

  const getVariantStyles = () => {
    // Dark mode uses semi-transparent backgrounds
    if (isDark) {
      switch (variant) {
        case 'primary':
          return { bg: `${colors.primary[500]}25`, text: colors.primary[400] };
        case 'success':
          return { bg: `${colors.success[500]}25`, text: colors.success[400] };
        case 'warning':
          return { bg: `${colors.warning[500]}25`, text: colors.warning[400] };
        case 'danger':
          return { bg: `${colors.danger[500]}25`, text: colors.danger[400] };
        case 'accent':
          return { bg: `${colors.accent[500]}25`, text: colors.accent[400] };
        default:
          return { bg: colors.neutral[800], text: colors.neutral[400] };
      }
    }
    // Light mode uses solid backgrounds
    switch (variant) {
      case 'primary':
        return { bg: colors.primary[100], text: colors.primary[700] };
      case 'success':
        return { bg: colors.success[100], text: colors.success[700] };
      case 'warning':
        return { bg: colors.warning[100], text: colors.warning[700] };
      case 'danger':
        return { bg: colors.danger[100], text: colors.danger[700] };
      case 'accent':
        return { bg: colors.accent[100], text: colors.accent[700] };
      default:
        return { bg: colors.neutral[100], text: colors.neutral[700] };
    }
  };

  const variantStyles = getVariantStyles();

  return (
    <View style={[
      styles.base,
      styles[`${size}Size`],
      { backgroundColor: variantStyles.bg },
      style
    ]}>
      <Text style={[
        styles.text,
        styles[`${size}Text`],
        { color: variantStyles.text }
      ]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    alignSelf: 'flex-start',
    borderRadius: 6, // Slightly rounded square shape
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

  // Text sizes
  smText: {
    fontSize: typography.fontSize.xs,
  },
  mdText: {
    fontSize: typography.fontSize.sm,
  },
});

export default Badge;
