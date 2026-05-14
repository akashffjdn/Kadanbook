/**
 * Palette shape — every theme MUST implement this.
 * Components read color tokens via `theme.colors.<group>.<key>`.
 */
export interface Palette {
  name: 'amoled' | 'midnight' | 'cream' | 'light';
  isDark: boolean;

  bg: {
    base: string; // root background
    surface: string; // cards
    elevated: string; // modals, bottom sheets
    overlay: string; // backdrop dim
    inverse: string; // contrast surface
  };

  border: {
    subtle: string; // 1px separators
    strong: string; // emphasis
    focus: string; // input focus ring
  };

  brand: {
    primary: string; // main CTA color
    primaryMuted: string;
    primaryDark: string;
    onPrimary: string; // text/icon on brand
    glow: string; // soft halo (rgba)
  };

  semantic: {
    success: string;
    successBg: string;
    warning: string;
    warningBg: string;
    danger: string;
    dangerBg: string;
    info: string;
    infoBg: string;
  };

  text: {
    primary: string;
    secondary: string;
    muted: string;
    inverse: string;
    onBrand: string;
  };

  status: {
    pending: string;
    paid: string;
    overdue: string;
  };

  gradient: {
    primary: [string, string];
    surface: [string, string];
    success: [string, string];
    glow: [string, string];
  };
}
