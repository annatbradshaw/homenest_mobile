import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, typography, spacing, borderRadius } from '../../config/theme';

interface StatCardProps {
  icon?: React.ReactNode;
  label: string;
  value: string | number;
  subtitle?: string;
  color?: string;
  style?: ViewStyle;
}

export function StatCard({
  icon,
  label,
  value,
  subtitle,
  color = colors.neutral[600],
  style,
}: StatCardProps) {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.header}>
        {icon && <View style={styles.icon}>{icon}</View>}
        <Text style={styles.label}>{label}</Text>
      </View>
      <Text style={[styles.value, { color }]}>{value}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginBottom: spacing[2],
  },
  icon: {},
  label: {
    fontSize: typography.fontSize.sm,
    color: colors.neutral[500],
  },
  value: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
  },
  subtitle: {
    fontSize: typography.fontSize.xs,
    color: colors.neutral[500],
    marginTop: spacing[1],
  },
});

export default StatCard;
