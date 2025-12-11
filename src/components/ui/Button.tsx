import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  TouchableOpacityProps,
} from 'react-native';
import { colors, borderRadius, typography, componentStyles } from '../../config/theme';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'accent';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export function Button({
  title,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  style,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  const buttonStyle: ViewStyle[] = [
    styles.base,
    styles[variant],
    styles[`${size}Size`],
    fullWidth && styles.fullWidth,
    isDisabled && styles.disabled,
    style as ViewStyle,
  ].filter(Boolean) as ViewStyle[];

  const textStyle: TextStyle[] = [
    styles.text,
    styles[`${variant}Text`],
    styles[`${size}Text`],
    isDisabled && styles.disabledText,
  ].filter(Boolean) as TextStyle[];

  const spinnerColor = variant === 'primary' || variant === 'danger' || variant === 'accent'
    ? colors.white
    : colors.primary[500];

  return (
    <TouchableOpacity
      style={buttonStyle}
      disabled={isDisabled}
      activeOpacity={0.7}
      {...props}
    >
      {loading ? (
        <ActivityIndicator size="small" color={spinnerColor} />
      ) : (
        <>
          {leftIcon}
          <Text style={textStyle}>{title}</Text>
          {rightIcon}
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.base,
    gap: 8,
  },

  // Variants - Updated with brandbook colors
  primary: {
    backgroundColor: colors.primary[500], // Forest green
  },
  secondary: {
    backgroundColor: colors.cream, // Warm cream background
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  danger: {
    backgroundColor: colors.danger[500],
  },
  accent: {
    backgroundColor: colors.accent[500], // Terracotta
  },

  // Sizes
  smSize: {
    height: componentStyles.button.sizes.sm.height,
    paddingHorizontal: componentStyles.button.sizes.sm.paddingHorizontal,
  },
  mdSize: {
    height: componentStyles.button.sizes.md.height,
    paddingHorizontal: componentStyles.button.sizes.md.paddingHorizontal,
  },
  lgSize: {
    height: componentStyles.button.sizes.lg.height,
    paddingHorizontal: componentStyles.button.sizes.lg.paddingHorizontal,
  },

  // Text styles - Updated with brandbook colors
  text: {
    fontWeight: typography.fontWeight.semibold,
  },
  primaryText: {
    color: colors.white,
  },
  secondaryText: {
    color: colors.charcoal,
  },
  outlineText: {
    color: colors.charcoal,
  },
  ghostText: {
    color: colors.primary[500], // Forest green
  },
  dangerText: {
    color: colors.white,
  },
  accentText: {
    color: colors.white,
  },

  // Text sizes
  smText: {
    fontSize: componentStyles.button.sizes.sm.fontSize,
  },
  mdText: {
    fontSize: componentStyles.button.sizes.md.fontSize,
  },
  lgText: {
    fontSize: componentStyles.button.sizes.lg.fontSize,
  },

  // States
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
  disabledText: {
    opacity: 0.8,
  },
});

export default Button;
