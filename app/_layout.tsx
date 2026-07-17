import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  NotoSansKR_300Light,
  NotoSansKR_400Regular,
  NotoSansKR_500Medium,
} from '@expo-google-fonts/noto-sans-kr';
import {
  NotoSerifKR_300Light,
  NotoSerifKR_400Regular,
  NotoSerifKR_500Medium,
} from '@expo-google-fonts/noto-serif-kr';
import 'react-native-reanimated';
import { AppAlertHost } from '@/components/AppAlertHost';
import { colors } from '@/constants/theme';

export { ErrorBoundary } from 'expo-router';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});

export default function RootLayout() {
  const [loaded, error] = useFonts({
    NotoSansKR: NotoSansKR_400Regular,
    NotoSansKR_Light: NotoSansKR_300Light,
    NotoSansKR_Medium: NotoSansKR_500Medium,
    NotoSerifKR: NotoSerifKR_400Regular,
    NotoSerifKR_Light: NotoSerifKR_300Light,
    NotoSerifKR_Medium: NotoSerifKR_500Medium,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.background },
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="onboarding" options={{ gestureEnabled: false }} />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="anniversary/[id]" />
          <Stack.Screen name="parent/[id]" />
          <Stack.Screen name="memory/[id]" />
          <Stack.Screen
            name="memory/edit"
            options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
          />
          <Stack.Screen
            name="story/answer"
            options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
          />
        </Stack>
        <AppAlertHost />
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
