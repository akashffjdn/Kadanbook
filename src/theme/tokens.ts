/**
 * Immutable design tokens. These do NOT vary across themes — only colors do.
 * Shared by every palette and every component.
 */

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 48,
} as const;

export const radius = {
  sm: 8,
  md: 10,
  base: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  full: 9999,
} as const;

export const fontSize = {
  displayHero: 40,
  display: 32,
  title: 24,
  subtitle: 18,
  bodyLarge: 16,
  body: 14,
  caption: 12,
  label: 11,
} as const;

export const lineHeight = {
  tight: 1.2,
  normal: 1.4,
  relaxed: 1.5,
} as const;

export const fontWeight = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} as const;

export const letterSpacing = {
  heroNeg: -1.5,
  displayNeg: -0.5,
  normal: 0,
  label: 0.8,
} as const;

export const motion = {
  fast: 150,
  base: 250,
  slow: 400,
  spring: {
    default: { damping: 18, stiffness: 220, mass: 1 },
    bouncy: { damping: 12, stiffness: 280, mass: 0.9 },
    gentle: { damping: 22, stiffness: 160, mass: 1 },
  },
} as const;

export const touchTarget = {
  min: 48,
  primary: 56,
} as const;

export const elevation = {
  level0: { shadowOpacity: 0, shadowRadius: 0, elevation: 0 },
  level1: {
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  level2: {
    shadowOpacity: 0.15,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  level3: {
    shadowOpacity: 0.25,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
} as const;

export const opacity = {
  pressed: 0.7,
  disabled: 0.4,
  overlay: 0.55,
  subtle: 0.12,
} as const;

export const breakpoints = {
  xs: 0,
  sm: 360,
  md: 414,
  lg: 768,
} as const;

export const tokens = {
  spacing,
  radius,
  fontSize,
  lineHeight,
  fontWeight,
  letterSpacing,
  motion,
  touchTarget,
  elevation,
  opacity,
  breakpoints,
} as const;

export type Tokens = typeof tokens;
