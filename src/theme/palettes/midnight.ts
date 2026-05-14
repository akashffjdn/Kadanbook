import type { Palette } from './types';

/**
 * MIDNIGHT — Deep navy + electric blue.
 * Revolut-inspired modern professional vibe.
 */
export const midnight: Palette = {
  name: 'midnight',
  isDark: true,

  bg: {
    base: '#0A0E27',
    surface: '#131838',
    elevated: '#1C2347',
    overlay: 'rgba(10,14,39,0.78)',
    inverse: '#FFFFFF',
  },

  border: {
    subtle: '#1F2752',
    strong: '#2D3766',
    focus: '#4C9EFF',
  },

  brand: {
    primary: '#4C9EFF',
    primaryMuted: '#7AB8FF',
    primaryDark: '#2F7CD9',
    onPrimary: '#FFFFFF',
    glow: 'rgba(76,158,255,0.22)',
  },

  semantic: {
    success: '#22D3A4',
    successBg: 'rgba(34,211,164,0.14)',
    warning: '#FFB938',
    warningBg: 'rgba(255,185,56,0.14)',
    danger: '#FF5C7A',
    dangerBg: 'rgba(255,92,122,0.14)',
    info: '#8B9EFF',
    infoBg: 'rgba(139,158,255,0.14)',
  },

  text: {
    primary: '#FFFFFF',
    secondary: '#B0BEE0',
    muted: '#5E6B95',
    inverse: '#0A0E27',
    onBrand: '#FFFFFF',
  },

  status: {
    pending: '#FFB938',
    paid: '#22D3A4',
    overdue: '#FF5C7A',
  },

  gradient: {
    primary: ['#4C9EFF', '#7AB8FF'],
    surface: ['#131838', '#1C2347'],
    success: ['#22D3A4', '#15A782'],
    glow: ['rgba(76,158,255,0.3)', 'rgba(76,158,255,0)'],
  },
};
