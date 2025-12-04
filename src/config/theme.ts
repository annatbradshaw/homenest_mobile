// HomeNest Design System
// Based on DESIGN_SYSTEM.md specifications

export const colors = {
  // Primary - Blue (Trust & Professionalism)
  primary: {
    50: '#EFF6FF',
    100: '#DBEAFE',
    200: '#BFDBFE',
    300: '#93C5FD',
    400: '#60A5FA',
    500: '#3B82F6',
    600: '#2563EB', // Primary brand color
    700: '#1D4ED8',
    800: '#1E40AF',
    900: '#1E3A8A',
  },

  // Accent - Amber (Construction/Home Energy)
  accent: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    200: '#FDE68A',
    300: '#FCD34D',
    400: '#FBBF24',
    500: '#F59E0B', // Primary accent
    600: '#D97706',
    700: '#B45309',
    800: '#92400E',
    900: '#78350F',
  },

  // Success - Emerald
  success: {
    50: '#ECFDF5',
    100: '#D1FAE5',
    200: '#A7F3D0',
    300: '#6EE7B7',
    400: '#34D399',
    500: '#10B981', // Primary success
    600: '#059669',
    700: '#047857',
    800: '#065F46',
    900: '#064E3B',
  },

  // Danger - Red
  danger: {
    50: '#FEF2F2',
    100: '#FEE2E2',
    200: '#FECACA',
    300: '#FCA5A5',
    400: '#F87171',
    500: '#EF4444', // Primary danger
    600: '#DC2626',
    700: '#B91C1C',
    800: '#991B1B',
    900: '#7F1D1D',
  },

  // Warning - Yellow
  warning: {
    50: '#FEFCE8',
    100: '#FEF9C3',
    200: '#FEF08A',
    300: '#FDE047',
    400: '#FACC15',
    500: '#EAB308',
    600: '#CA8A04',
    700: '#A16207',
    800: '#854D0E',
    900: '#713F12',
  },

  // Neutral - Slate
  neutral: {
    50: '#F8FAFC',
    100: '#F1F5F9',
    200: '#E2E8F0',
    300: '#CBD5E1',
    400: '#94A3B8',
    500: '#64748B',
    600: '#475569',
    700: '#334155',
    800: '#1E293B',
    900: '#0F172A',
    950: '#020617',
  },

  // Semantic colors
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
};

// Light theme colors
export const lightTheme = {
  background: {
    primary: colors.white,
    secondary: colors.neutral[50],
    tertiary: colors.neutral[100],
  },
  text: {
    primary: colors.neutral[900],
    secondary: colors.neutral[600],
    tertiary: colors.neutral[500],
    inverse: colors.white,
  },
  border: {
    primary: colors.neutral[200],
    secondary: colors.neutral[300],
  },
  card: {
    background: colors.white,
    border: colors.neutral[200],
  },
};

// Dark theme colors
export const darkTheme = {
  background: {
    primary: colors.neutral[900],
    secondary: colors.neutral[800],
    tertiary: colors.neutral[700],
  },
  text: {
    primary: colors.neutral[50],
    secondary: colors.neutral[300],
    tertiary: colors.neutral[400],
    inverse: colors.neutral[900],
  },
  border: {
    primary: colors.neutral[700],
    secondary: colors.neutral[600],
  },
  card: {
    background: colors.neutral[800],
    border: colors.neutral[700],
  },
};

// Typography
export const typography = {
  fontFamily: {
    regular: 'System',
    medium: 'System',
    semibold: 'System',
    bold: 'System',
  },
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
  },
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
  fontWeight: {
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
};

// Spacing
export const spacing = {
  0: 0,
  0.5: 2,
  1: 4,
  1.5: 6,
  2: 8,
  2.5: 10,
  3: 12,
  3.5: 14,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  9: 36,
  10: 40,
  11: 44,
  12: 48,
  14: 56,
  16: 64,
  20: 80,
  24: 96,
  28: 112,
  32: 128,
};

// Border radius
export const borderRadius = {
  none: 0,
  sm: 4,
  base: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  full: 9999,
};

// Shadows
export const shadows = {
  none: {
    shadowColor: colors.transparent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  base: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  lg: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
  },
  xl: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 12,
  },
};

// Animation durations
export const animation = {
  duration: {
    fast: 150,
    normal: 300,
    slow: 500,
  },
};

// Z-index
export const zIndex = {
  base: 0,
  dropdown: 10,
  sticky: 20,
  fixed: 30,
  modal: 40,
  popover: 50,
  tooltip: 60,
  toast: 70,
};

// Component-specific styles
export const componentStyles = {
  button: {
    sizes: {
      sm: {
        height: 32,
        paddingHorizontal: spacing[3],
        fontSize: typography.fontSize.sm,
      },
      md: {
        height: 40,
        paddingHorizontal: spacing[4],
        fontSize: typography.fontSize.base,
      },
      lg: {
        height: 48,
        paddingHorizontal: spacing[6],
        fontSize: typography.fontSize.lg,
      },
    },
  },
  input: {
    height: 44,
    borderRadius: borderRadius.base,
    paddingHorizontal: spacing[4],
    fontSize: typography.fontSize.base,
  },
  card: {
    borderRadius: borderRadius.lg,
    padding: spacing[4],
  },
};

// Status colors for projects, stages, etc.
export const statusColors = {
  project: {
    planning: colors.primary[500],
    'in-progress': colors.accent[500],
    completed: colors.success[500],
    'on-hold': colors.neutral[500],
  },
  stage: {
    'not-started': colors.neutral[400],
    'in-progress': colors.accent[500],
    completed: colors.success[500],
  },
  todo: {
    todo: colors.neutral[400],
    'in-progress': colors.primary[500],
    completed: colors.success[500],
    cancelled: colors.danger[400],
  },
  expense: {
    pending: colors.warning[500],
    paid: colors.success[500],
  },
};

// Priority colors
export const priorityColors = {
  low: colors.neutral[400],
  medium: colors.primary[500],
  high: colors.accent[500],
  urgent: colors.danger[500],
};

// Category colors for stages
export const categoryColors = {
  'site-work': '#8B5CF6', // Purple
  utilities: '#06B6D4', // Cyan
  structure: '#F97316', // Orange
  interior: '#EC4899', // Pink
  exterior: '#84CC16', // Lime
  finishing: '#14B8A6', // Teal
  other: colors.neutral[500],
};
