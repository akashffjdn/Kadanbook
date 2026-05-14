/**
 * In-house Unistyles-compatible shim.
 * Drop-in replacement for `react-native-unistyles` v2 API surface
 * (createStyleSheet, useStyles, UnistylesRuntime, UnistylesRegistry) — pure JS,
 * no native module dependency.
 *
 * Required because Unistyles needs a native runtime that isn't bundled in
 * Expo Go. This shim is backed by our existing Zustand theme store, so theme
 * switching still works the same way (`useThemeStore.setMode('cream')`).
 *
 * Trade-off vs real Unistyles: no breakpoint system, no media-query
 * variants, no Skia integration — but every API our app uses is preserved.
 */
import { useMemo } from 'react';
import type { ImageStyle, TextStyle, ViewStyle } from 'react-native';
import { useThemeStore } from '@/store/theme.store';

// Loose type so authored stylesheets don't fight with RN's strict literal types.
// (Real Unistyles uses a similar trick — the runtime resolver returns ViewStyle/TextStyle.)
export type StyleEntry = (ViewStyle | TextStyle | ImageStyle) & {
  variants?: Record<string, Record<string, ViewStyle | TextStyle | ImageStyle>>;
} & Record<string, any>;
type StylesheetMap = Record<string, StyleEntry>;
type StylesheetFn = (theme: any) => Record<string, any>;

// Themes registered via UnistylesRegistry.addThemes() at app bootstrap.
const internal = {
  themes: {} as Record<string, any>,
  fallback: 'amoled' as string,
};

const setRegisteredThemes = (themes: Record<string, any>) => {
  internal.themes = themes;
  const firstKey = Object.keys(themes)[0];
  if (firstKey) internal.fallback = firstKey;
};

const resolveTheme = (mode: string): any =>
  internal.themes[mode] ?? internal.themes[internal.fallback] ?? {};

/** Hand back the same function. Real Unistyles also lazy-evaluates. */
export const createStyleSheet = <T extends StylesheetFn>(fn: T): T => fn;

/** Merge `variants.<key>.<selected>` styles into the base style. */
const resolveVariants = (
  style: any,
  variantState: Record<string, string | undefined> = {},
): any => {
  if (!style || typeof style !== 'object') return style ?? {};
  const variants = style.variants;
  if (!variants) return style;
  const { variants: _v, ...base } = style;
  const result: Record<string, unknown> = { ...base };
  for (const key of Object.keys(variants)) {
    const selected = variantState[key];
    if (selected !== undefined && variants[key]?.[selected]) {
      Object.assign(result, variants[key][selected]);
    }
  }
  return result;
};

// Return styles as `any` indexed shape so callers can pass values to
// View/Text/Image style props without TS narrowing complaints.
export type ResolvedStyles = Record<string, any>;

export const useStyles = (
  stylesheet?: StylesheetFn,
  variantState?: Record<string, string | undefined>,
): { styles: ResolvedStyles; theme: any } => {
  const mode = useThemeStore((s) => s.mode);
  const theme: any = resolveTheme(mode);

  const variantKey = variantState ? JSON.stringify(variantState) : '';
  const styles = useMemo<ResolvedStyles>(() => {
    if (!stylesheet) return {};
    const raw = stylesheet(theme);
    const out: ResolvedStyles = {};
    for (const key of Object.keys(raw)) {
      out[key] = resolveVariants(raw[key], variantState);
    }
    return out;
  }, [stylesheet, mode, variantKey]); // eslint-disable-line react-hooks/exhaustive-deps

  return { styles, theme };
};

export const UnistylesRuntime = {
  get themeName(): string {
    return useThemeStore.getState().mode;
  },
  setTheme(name: string): void {
    // Cast — caller passes a registered theme name.
    (useThemeStore.getState().setMode as (m: any) => void)(name);
  },
};

class _UnistylesRegistry {
  addBreakpoints(_b: Record<string, number>): this {
    return this;
  }
  addThemes(themes: Record<string, any>): this {
    setRegisteredThemes(themes);
    return this;
  }
  addConfig(config: { initialTheme?: string; [k: string]: unknown }): this {
    if (config.initialTheme && internal.themes[config.initialTheme]) {
      internal.fallback = config.initialTheme;
    }
    return this;
  }
}
export const UnistylesRegistry = new _UnistylesRegistry();

// Type re-exports (declared empty so app-side module augmentation still type-checks).
export interface UnistylesThemes {}
export interface UnistylesBreakpoints {}
