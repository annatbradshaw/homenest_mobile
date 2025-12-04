import React from 'react';
import { View, StyleSheet, ViewStyle, ViewProps, TouchableOpacity } from 'react-native';
import { colors, borderRadius, spacing, shadows } from '../../config/theme';

type CardVariant = 'default' | 'elevated' | 'outlined';

interface CardProps extends ViewProps {
  variant?: CardVariant;
  padding?: keyof typeof spacing;
  onPress?: () => void;
  children: React.ReactNode;
}

export function Card({
  variant = 'default',
  padding = 4,
  onPress,
  children,
  style,
  ...props
}: CardProps) {
  const cardStyle: ViewStyle[] = [
    styles.base,
    styles[variant],
    { padding: spacing[padding] },
    style as ViewStyle,
  ];

  if (onPress) {
    return (
      <TouchableOpacity
        style={cardStyle}
        onPress={onPress}
        activeOpacity={0.7}
        {...props}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View style={cardStyle} {...props}>
      {children}
    </View>
  );
}

interface CardHeaderProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export function CardHeader({ children, style }: CardHeaderProps) {
  return <View style={[styles.header, style]}>{children}</View>;
}

interface CardContentProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export function CardContent({ children, style }: CardContentProps) {
  return <View style={[styles.content, style]}>{children}</View>;
}

interface CardFooterProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export function CardFooter({ children, style }: CardFooterProps) {
  return <View style={[styles.footer, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  base: {
    borderRadius: borderRadius.lg,
    backgroundColor: colors.white,
  },
  default: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  elevated: {
    backgroundColor: colors.white,
    ...shadows.md,
  },
  outlined: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.neutral[300],
  },
  header: {
    paddingBottom: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[100],
    marginBottom: spacing[3],
  },
  content: {
    // Default content styles
  },
  footer: {
    paddingTop: spacing[3],
    borderTopWidth: 1,
    borderTopColor: colors.neutral[100],
    marginTop: spacing[3],
  },
});

export default Card;
