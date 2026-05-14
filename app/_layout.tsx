// Polyfill — required for web Fast Refresh and runtime utils. Must be first.
import '@expo/metro-runtime';

import { AppProviders } from '@/providers/AppProviders';
import { suppressLibraryWarnings } from '@/lib/suppressLibraryWarnings';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

// Filter known third-party noise (e.g. React 19 element.ref deprecation
// from react-native-svg / gesture-handler / @gorhom/bottom-sheet).
suppressLibraryWarnings();

SplashScreen.preventAutoHideAsync().catch(() => undefined);

export default function RootLayout() {
  useEffect(() => {
    // Hide the native splash once JS is ready — our in-app splash takes over.
    const t = setTimeout(() => {
      SplashScreen.hideAsync().catch(() => undefined);
    }, 200);
    return () => clearTimeout(t);
  }, []);

  return (
    <AppProviders>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: 'transparent' },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="index" options={{ animation: 'fade' }} />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
        <Stack.Screen name="customer/[id]" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen
          name="customer/new"
          options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
        />
        <Stack.Screen
          name="kadan/new"
          options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
        />
        <Stack.Screen
          name="payment/collect"
          options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
        />
        <Stack.Screen name="notifications" />
        <Stack.Screen name="settings" />
        <Stack.Screen name="settings/reminder-template" />
        <Stack.Screen name="privacy" />
        <Stack.Screen name="help" />
        <Stack.Screen name="refer" />
        <Stack.Screen name="about" />
        <Stack.Screen name="change-number" />
        <Stack.Screen name="delete-account" />
      </Stack>
    </AppProviders>
  );
}
