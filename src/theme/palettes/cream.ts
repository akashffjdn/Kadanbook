import type { Palette } from './types';

/**
 * CREAM — Warm off-white + terracotta.
 * Notion-style soft warmth, easy on the eyes during the day.
 */
export const cream: Palette = {
  name: 'cream',
  isDark: false,

  bg: {
    base: '#FAF7F2',
    surface: '#FFFFFF',
    elevated: '#FFFFFF',
    overlay: 'rgba(26,16,8,0.45)',
    inverse: '#1A1A1A',
  },

  border: {
    subtle: '#EDE6D9',
    strong: '#D9CFBE',
    focus: '#C2410C',
  },

  brand: {
    primary: '#C2410C',
    primaryMuted: '#EA580C',
    primaryDark: '#9A3308',
    onPrimary: '#FFFFFF',
    glow: 'rgba(194,65,12,0.16)',
  },

  semantic: {
    success: '#16A34A',
    successBg: 'rgba(22,163,74,0.10)',
    warning: '#D97706',
    warningBg: 'rgba(217,119,6,0.10)',
    danger: '#DC2626',
    dangerBg: 'rgba(220,38,38,0.10)',
    info: '#0284C7',
    infoBg: 'rgba(2,132,199,0.10)',
  },

  text: {
    primary: '#1A1A1A',
    secondary: '#6B6B6B',
    muted: '#9A9A9A',
    inverse: '#FFFFFF',
    onBrand: '#FFFFFF',
  },

  status: {
    pending: '#D97706',
    paid: '#16A34A',
    overdue: '#DC2626',
  },

  gradient: {
    primary: ['#C2410C', '#EA580C'],
    surface: ['#FFFFFF', '#F5F0E8'],
    success: ['#16A34A', '#15803D'],
    glow: ['rgba(194,65,12,0.18)', 'rgba(194,65,12,0)'],
  },
};
