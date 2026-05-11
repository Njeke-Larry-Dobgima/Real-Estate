/**
 * Color palette for MapHouse app
 */

export const Colors = {
  // Primary colors
  primary: '#6C47FF',
  primaryLight: '#8B6FFF',
  primaryDark: '#5535E8',

  // Secondary colors
  whatsappGreen: '#25D366',

  // Background colors
  background: '#F8F8F8',
  cardBackground: '#FFFFFF',

  // Text colors
  textPrimary: '#1A1A2E',
  textSecondary: '#666680',
  textLight: '#999999',

  // Border and divider colors
  border: '#E8E8F0',
  divider: '#E8E8F0',

  // Status colors
  success: '#22C55E',
  successLight: '#DCFCE7',
  error: '#EF4444',
  errorLight: '#FEE2E2',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',

  // Neutral colors
  white: '#FFFFFF',
  black: '#000000',
  gray100: '#F7F7F7',
  gray200: '#E8E8F0',
  gray300: '#D1D1DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',

  // Map colors
  markerBackground: '#6C47FF',
  markerText: '#FFFFFF',

  // Shadow color
  shadow: '#000000',

  // Transparent colors
  transparent: 'transparent',
  semiTransparentWhite: 'rgba(255, 255, 255, 0.9)',
  semiTransparentBlack: 'rgba(0, 0, 0, 0.5)',
  overlay: 'rgba(0, 0, 0, 0.3)',
} as const;

/**
 * Typography sizes
 */
export const FontSizes = {
  caption: 13,
  bodySmall: 14,
  body: 15,
  subtitle: 17,
  title: 20,
  price: 24,
  large: 28,
} as const;

/**
 * Border radius values
 */
export const BorderRadius = {
  small: 8,
  card: 12,
  pill: 20,
  circle: 999,
} as const;

/**
 * Shadow styles
 */
export const Shadows = {
  small: {
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  large: {
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 5,
  },
} as const;

/**
 * Spacing values
 */
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;
