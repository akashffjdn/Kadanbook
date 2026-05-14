import type { Palette } from './types';

/**
 * LIGHT — Pure white + indigo.
 * Cash App-style clarity, high-contrast for outdoor / daylight use.
 */
export const light: Palette = {
  name: 'light',
  isDark: false,

  bg: {
    base: '#FFFFFF',
    surface: '#F8F9FB',
    elevated: '#FFFFFF',
    overlay: 'rgba(0,0,0,0.45)',
    inverse: '#0A0A0A',
  },

  border: {
    subtle: '#EEF0F4',
    strong: '#D6DAE2',
    focus: '#4F46E5',
  },

  brand: {
    primary: '#4F46E5',
    primaryMuted: '#6366F1',
    primaryDark: '#3730A3',
    onPrimary: '#FFFFFF',
    glow: 'rgba(79,70,229,0.16)',
  },

  semantic: {
    success: '#059669',
    successBg: 'rgba(5,150,105,0.10)',
    warning: '#D97706',
    warningBg: 'rgba(217,119,6,0.10)',
    danger: '#DC2626',
    dangerBg: 'rgba(220,38,38,0.10)',
    info: '#0284C7',
    infoBg: 'rgba(2,132,199,0.10)',
  },

  text: {
    primary: '#0A0A0A',
    secondary: '#525252',
    muted: '#A3A3A3',
    inverse: '#FFFFFF',
    onBrand: '#FFFFFF',
  },

  status: {
    pending: '#D97706',
    paid: '#059669',
    overdue: '#DC2626',
  },

  gradient: {
    primary: ['#4F46E5', '#6366F1'],
    surface: ['#FFFFFF', '#F1F2F6'],
    success: ['#059669', '#047857'],
    glow: ['rgba(79,70,229,0.18)', 'rgba(79,70,229,0)'],
  },
};
