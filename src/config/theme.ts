// HomeNest Design System
// Based on brandbook specifications (homenest-brandbook.jsx)

export const colors = {
  // Primary - Forest Green (Trust & Home)
  primary: {
    50: '#E8F5E9',
    100: '#C8E6C9',
    200: '#A5D6A7',
    300: '#81C784',
    400: '#4A8A74',
    500: '#2D5A4A', // Primary brand color
    600: '#265043',
    700: '#1E3D32',
    800: '#172E26',
    900: '#0F1F1A',
  },

  // Accent - Terracotta (Warmth & Energy)
  accent: {
    50: '#FDF4ED',
    100: '#FAE5D3',
    200: '#F5D0B5',
    300: '#F2C4A8',
    400: '#EDB895',
    500: '#E8A87C', // Primary accent
    600: '#D4896A',
    700: '#C06A4A',
    800: '#A85A3D',
    900: '#8A4830',
  },

  // Success - Green
  success: {
    50: '#E8F5E9',
    100: '#C8E6C9',
    200: '#A5D6A7',
    300: '#81C784',
    400: '#66BB6A',
    500: '#4CAF50', // Primary success
    600: '#43A047',
    700: '#388E3C',
    800: '#2E7D32',
    900: '#1B5E20',
  },

  // Danger - Red
  danger: {
    50: '#FFEBEE',
    100: '#FFCDD2',
    200: '#EF9A9A',
    300: '#E57373',
    400: '#EF5350',
    500: '#E53935', // Primary danger
    600: '#E53935',
    700: '#D32F2F',
    800: '#C62828',
    900: '#B71C1C',
  },

  // Warning - Orange
  warning: {
    50: '#FFF3E0',
    100: '#FFE0B2',
    200: '#FFCC80',
    300: '#FFB74D',
    400: '#FFA726',
    500: '#FF9800', // Primary warning
    600: '#FB8C00',
    700: '#F57C00',
    800: '#EF6C00',
    900: '#E65100',
  },

  // Info - Blue
  info: {
    50: '#E3F2FD',
    100: '#BBDEFB',
    200: '#90CAF9',
    300: '#64B5F6',
    400: '#42A5F5',
    500: '#2196F3', // Primary info
    600: '#1E88E5',
    700: '#1976D2',
    800: '#1565C0',
    900: '#0D47A1',
  },

  // Neutral - Warm grays from brandbook
  neutral: {
    50: '#FDFBF8',  // Warm white
    100: '#F5F5F5', // Gray 100
    200: '#E5E5E5', // Gray 200
    300: '#D4D4D4',
    400: '#999999', // Gray 400
    500: '#737373',
    600: '#666666', // Gray 600
    700: '#404040',
    800: '#2A2A2A', // Charcoal
    900: '#1A1A1A',
    950: '#0F0F0F',
  },

  // Brand-specific colors
  cream: '#F5EDE4',
  warmWhite: '#FDFBF8',
  charcoal: '#2A2A2A',
  forest: '#2D5A4A',
  forestDark: '#1E3D32',
  forestLight: '#3D7A64',
  terracotta: '#E8A87C',
  terracottaDark: '#D4896A',
  terracottaLight: '#F2C4A8',

  // Semantic colors
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
};

// Light theme colors
export const lightTheme = {
  background: {
    primary: colors.warmWhite,    // Main page background
    secondary: colors.cream,       // Section backgrounds
    tertiary: colors.neutral[100], // Subtle backgrounds
  },
  text: {
    primary: colors.charcoal,      // Headings
    secondary: colors.neutral[600], // Body text
    tertiary: colors.neutral[400],  // Hints, captions
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
    primary: colors.neutral[900],   // Main page background
    secondary: colors.neutral[800], // Section backgrounds
    tertiary: colors.neutral[700],  // Subtle backgrounds
  },
  text: {
    primary: colors.neutral[50],    // Headings
    secondary: colors.neutral[300], // Body text
    tertiary: colors.neutral[400],  // Hints, captions
    inverse: colors.charcoal,
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
// Note: Custom fonts (Fraunces, Outfit) to be added later
// For now using system fonts with proper weight mapping
export const typography = {
  fontFamily: {
    // Display fonts (for headlines) - Fraunces serif
    display: 'Fraunces_400Regular',
    displayLight: 'Fraunces_300Light',
    displayMedium: 'Fraunces_500Medium',
    displaySemibold: 'Fraunces_600SemiBold',
    displayBold: 'Fraunces_700Bold',
    // Body fonts (for UI) - Outfit sans-serif
    body: 'Outfit_400Regular',
    bodyLight: 'Outfit_300Light',
    bodyMedium: 'Outfit_500Medium',
    bodySemibold: 'Outfit_600SemiBold',
    bodyBold: 'Outfit_700Bold',
    // Legacy mappings (using body fonts)
    regular: 'Outfit_400Regular',
    medium: 'Outfit_500Medium',
    semibold: 'Outfit_600SemiBold',
    bold: 'Outfit_700Bold',
  },
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 22,  // H2 in mobile
    '3xl': 28,  // H1 in mobile
    '4xl': 36,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.6,
  },
  fontWeight: {
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
  // Letter spacing for overlines
  letterSpacing: {
    normal: 0,
    wide: 0.5,
    wider: 1,
    widest: 1.6, // For overlines (0.1em at 16px)
  },
};

// Spacing - aligned with brandbook
export const spacing = {
  0: 0,
  0.5: 2,
  1: 4,    // xs
  1.5: 6,
  2: 8,    // sm
  2.5: 10,
  3: 12,
  3.5: 14,
  4: 16,   // md (default)
  5: 20,
  6: 24,   // lg
  7: 28,
  8: 32,   // xl
  9: 36,
  10: 40,
  11: 44,
  12: 48,  // 2xl
  14: 56,
  16: 64,  // 3xl
  20: 80,
  24: 96,
  28: 112,
  32: 128,
};

// Border radius - aligned with brandbook
export const borderRadius = {
  none: 0,
  sm: 4,     // Inputs, small elements
  base: 8,   // Buttons, tags
  md: 12,    // Cards, modals
  lg: 16,    // Large cards
  xl: 20,
  '2xl': 24,
  full: 9999, // Pills, avatars
};

// Shadows - warmer feel per brandbook
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
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 1,
  },
  base: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  md: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  lg: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 8,
  },
  xl: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.12,
    shadowRadius: 48,
    elevation: 12,
  },
};

// Animation durations - aligned with brandbook
export const animation = {
  duration: {
    instant: 100,  // Hover states, toggles
    fast: 200,     // Buttons, small elements
    normal: 300,   // Cards, modals opening
    slow: 400,     // Page transitions
    slower: 500,   // Complex sequences
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
        borderRadius: borderRadius.base,
      },
      md: {
        height: 40,
        paddingHorizontal: spacing[4],
        fontSize: typography.fontSize.base,
        borderRadius: borderRadius.base,
      },
      lg: {
        height: 48,
        paddingHorizontal: spacing[6],
        fontSize: typography.fontSize.lg,
        borderRadius: borderRadius.base,
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
    planning: colors.info[500],
    'in-progress': colors.accent[500],  // Terracotta
    completed: colors.success[500],
    'on-hold': colors.neutral[500],
  },
  stage: {
    'not-started': colors.neutral[400],
    'in-progress': colors.accent[500],  // Terracotta
    completed: colors.success[500],
  },
  todo: {
    todo: colors.neutral[400],
    'in-progress': colors.primary[500], // Forest green
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
  medium: colors.info[500],
  high: colors.accent[500],    // Terracotta
  urgent: colors.danger[500],
};

// Category colors for stages - updated with brand palette
export const categoryColors = {
  'site-work': '#8B5CF6',      // Purple
  utilities: '#06B6D4',        // Cyan
  structure: colors.accent[500], // Terracotta
  interior: '#EC4899',         // Pink
  exterior: colors.primary[400], // Forest light
  finishing: colors.primary[500], // Forest
  other: colors.neutral[500],
};
