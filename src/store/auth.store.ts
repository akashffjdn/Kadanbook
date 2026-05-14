import type { AuthSession, ShopProfile } from '@/types/domain';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { mmkvStorage } from './mmkv';

export interface AuthState {
  session: AuthSession | null;
  profile: ShopProfile | null;
  hasOnboarded: boolean;
  hasCompletedTour: boolean;

  setSession: (s: AuthSession) => void;
  setProfile: (p: ShopProfile) => void;
  completeOnboarding: () => void;
  completeTour: () => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      session: null,
      profile: null,
      hasOnboarded: false,
      hasCompletedTour: false,

      setSession: (session) => set({ session }),
      setProfile: (profile) => set({ profile }),
      completeOnboarding: () => set({ hasOnboarded: true }),
      completeTour: () => set({ hasCompletedTour: true }),
      logout: () => set({ session: null, profile: null }),
    }),
    {
      name: 'kadanbook-auth',
      storage: createJSONStorage(() => mmkvStorage),
    },
  ),
);

export const useIsAuthenticated = () =>
  useAuthStore((s) => s.session !== null && s.session.expiresAt > Date.now());
