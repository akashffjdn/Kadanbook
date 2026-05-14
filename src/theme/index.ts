import { UnistylesRegistry } from '@/lib/unistyles';
import { type Palette, amoled, cream, light, midnight } from './palettes';
import { tokens } from './tokens';
import { typography } from './typography';

/**
 * ⭐ THEME COMPOSITION
 * Each theme merges immutable tokens with a palette. Components access
 * everything via `theme.*` in createStyleSheet callbacks.
 */
const composeTheme = (palette: Palette) => ({
  ...tokens,
  colors: palette,
  typography,
});

export const themes = {
  amoled: composeTheme(amoled),
  midnight: composeTheme(midnight),
  cream: composeTheme(cream),
  light: composeTheme(light),
} as const;

export type AppThemes = typeof themes;
export type ThemeName = keyof AppThemes;
export type AppTheme = AppThemes[ThemeName];
type AppBreakpoints = typeof tokens.breakpoints;

declare module '@/lib/unistyles' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  export interface UnistylesThemes extends AppThemes {}
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  export interface UnistylesBreakpoints extends AppBreakpoints {}
}

/**
 * Call once at app entry (before any component renders).
 * Re-callable safely; we only configure once.
 */
let configured = false;
export const configureTheme = (initial: ThemeName = 'amoled') => {
  if (configured) return;
  configured = true;

  UnistylesRegistry.addBreakpoints(tokens.breakpoints).addThemes(themes).addConfig({
    adaptiveThemes: false,
    initialTheme: initial,
  });
};

export { tokens, typography };
export * from './palettes';
