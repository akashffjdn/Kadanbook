import type { ThemeName } from '@/theme';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { mmkvStorage } from './mmkv';

/**
 * ⭐ THE single variable controlling the entire app theme.
 * Mutate `mode` via `setMode()` — all subscribed components re-render
 * AND UnistylesRuntime.setTheme is invoked (see ThemeBridge component).
 */
export interface ThemeState {
  mode: ThemeName;
  setMode: (m: ThemeName) => void;
  cycle: () => void;
}

const order: ThemeName[] = ['amoled', 'midnight', 'cream', 'light'];

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      mode: 'amoled',
      setMode: (mode) => set({ mode }),
      cycle: () => {
        const cur = get().mode;
        const next = order[(order.indexOf(cur) + 1) % order.length]!;
        set({ mode: next });
      },
    }),
    {
      name: 'kadanbook-theme',
      storage: createJSONStorage(() => mmkvStorage),
    },
  ),
);
