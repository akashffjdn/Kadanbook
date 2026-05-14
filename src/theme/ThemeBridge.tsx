import { useThemeStore } from '@/store/theme.store';
import { useEffect } from 'react';
import { UnistylesRuntime } from '@/lib/unistyles';

/**
 * Bridges the Zustand theme store → Unistyles runtime.
 * Mount once at the root, then `useThemeStore.setMode('cream')`
 * (or theme picker) instantly re-skins every component in the app.
 */
export const ThemeBridge = () => {
  const mode = useThemeStore((s) => s.mode);

  useEffect(() => {
    if (UnistylesRuntime.themeName !== mode) {
      UnistylesRuntime.setTheme(mode);
    }
  }, [mode]);

  return null;
};
