import type { Palette } from './types';

/**
 * AMOLED — DEFAULT theme.
 * True-black background + warm orange brand. CRED-style premium dark luxury.
 * Battery-friendly on OLED screens.
 */
export const amoled: Palette = {
  name: 'amoled',
  isDark: true,

  bg: {
    base: '#000000',
    surface: '#0D0D0D',
    elevated: '#161616',
    overlay: 'rgba(0,0,0,0.75)',
    inverse: '#FFFFFF',
  },

  border: {
    subtle: '#1F1F1F',
    strong: '#2A2A2A',
    focus: '#FF6B00',
  },

  brand: {
    primary: '#FF6B00',
    primaryMuted: '#FF8C38',
    primaryDark: '#CC5500',
    onPrimary: '#FFFFFF',
    glow: 'rgba(255,107,0,0.18)',
  },

  semantic: {
    success: '#00C896',
    successBg: 'rgba(0,200,150,0.12)',
    warning: '#FFB800',
    warningBg: 'rgba(255,184,0,0.12)',
    danger: '#FF4C4C',
    dangerBg: 'rgba(255,76,76,0.12)',
    info: '#4C9EFF',
    infoBg: 'rgba(76,158,255,0.12)',
  },

  text: {
    primary: '#FFFFFF',
    secondary: '#A0A0A0',
    muted: '#505050',
    inverse: '#000000',
    onBrand: '#FFFFFF',
  },

  status: {
    pending: '#FFB800',
    paid: '#00C896',
    overdue: '#FF4C4C',
  },

  gradient: {
    primary: ['#FF6B00', '#FF8C38'],
    surface: ['#0D0D0D', '#161616'],
    success: ['#00C896', '#00B07F'],
    glow: ['rgba(255,107,0,0.25)', 'rgba(255,107,0,0)'],
  },
};
