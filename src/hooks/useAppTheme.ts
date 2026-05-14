import type { AppTheme, ThemeName } from '@/theme';
import { UnistylesRuntime, useStyles } from '@/lib/unistyles';

/**
 * Access the current resolved theme outside of createStyleSheet callbacks.
 * Use this when you need theme values for animations (e.g. Reanimated worklets)
 * or inline conditional styling.
 */
export const useAppTheme = (): { theme: AppTheme; name: ThemeName } => {
  const { theme } = useStyles();
  return { theme: theme as AppTheme, name: UnistylesRuntime.themeName as ThemeName };
};
