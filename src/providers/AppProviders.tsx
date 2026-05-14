import { useI18nSync } from '@/hooks/useI18nSync';
import { useDataStore } from '@/store/data.store';
import { useThemeStore } from '@/store/theme.store';
import { configureTheme } from '@/theme';
import { ThemeBridge } from '@/theme/ThemeBridge';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import {
  NotoSansTamil_400Regular,
  NotoSansTamil_500Medium,
  NotoSansTamil_600SemiBold,
  NotoSansTamil_700Bold,
} from '@expo-google-fonts/noto-sans-tamil';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { type PropsWithChildren, useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from '@/lib/keyboard';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Toaster } from 'sonner-native';

// Configure theme registry as early as possible (module evaluation order).
configureTheme(useThemeStore.getState().mode);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 30_000,
    },
  },
});

const FontGate = ({ children }: PropsWithChildren) => {
  const [loaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    NotoSansTamil_400Regular,
    NotoSansTamil_500Medium,
    NotoSansTamil_600SemiBold,
    NotoSansTamil_700Bold,
  });
  if (!loaded) return null;
  return <>{children}</>;
};

const SeedGate = ({ children }: PropsWithChildren) => {
  const seed = useDataStore((s) => s.seed);
  const hydratedSeed = useDataStore((s) => s.hydratedSeed);
  useEffect(() => {
    if (!hydratedSeed) seed();
  }, [hydratedSeed, seed]);
  return <>{children}</>;
};

const I18nGate = ({ children }: PropsWithChildren) => {
  useI18nSync();
  return <>{children}</>;
};

export const AppProviders = ({ children }: PropsWithChildren) => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <KeyboardProvider>
          <QueryClientProvider client={queryClient}>
            <BottomSheetModalProvider>
              <I18nGate>
                <FontGate>
                  <SeedGate>
                    <ThemeBridge />
                    {children}
                    <Toaster position="top-center" richColors closeButton duration={2800} />
                  </SeedGate>
                </FontGate>
              </I18nGate>
            </BottomSheetModalProvider>
          </QueryClientProvider>
        </KeyboardProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};
