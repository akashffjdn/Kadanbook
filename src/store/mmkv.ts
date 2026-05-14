/**
 * Storage adapter for Zustand persist.
 * Backed by AsyncStorage for Expo Go compatibility (MMKV requires a custom
 * dev client). Drop in MMKV later for a 30× speed-up once you ship a dev build.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { StateStorage } from 'zustand/middleware';

export const mmkvStorage: StateStorage = {
  setItem: async (name, value) => {
    await AsyncStorage.setItem(name, value);
  },
  getItem: async (name) => {
    return AsyncStorage.getItem(name);
  },
  removeItem: async (name) => {
    await AsyncStorage.removeItem(name);
  },
};

// Compat exports — kept so any code still importing these doesn't break.
export const storage = AsyncStorage;
export const secureStorage = AsyncStorage;
