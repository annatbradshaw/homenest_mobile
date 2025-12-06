import { useEffect, useState, useCallback } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '../stores/AuthContext';
import { ProjectProvider } from '../stores/ProjectContext';
import { ThemeProvider, useTheme } from '../stores/ThemeContext';
import { LanguageProvider } from '../stores/LanguageContext';
import { CurrencyProvider } from '../stores/CurrencyContext';
import { AnimatedSplash } from '../components/AnimatedSplash';
import { colors } from '../config/theme';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 2,
    },
  },
});

function RootLayoutNav() {
  const { isDark, theme } = useTheme();

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.background.secondary },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  const [appIsReady, setAppIsReady] = useState(false);
  const [splashAnimationComplete, setSplashAnimationComplete] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // Pre-load any resources or data here
        // For now, just a small delay to ensure smooth transition
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      // Hide the native splash screen
      await SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  const handleSplashAnimationComplete = useCallback(() => {
    setSplashAnimationComplete(true);
  }, []);

  if (!appIsReady) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <LanguageProvider>
              <CurrencyProvider>
                <AuthProvider>
                  <ProjectProvider>
                    <RootLayoutNav />
                    {!splashAnimationComplete && (
                      <AnimatedSplash onAnimationComplete={handleSplashAnimationComplete} />
                    )}
                  </ProjectProvider>
                </AuthProvider>
              </CurrencyProvider>
            </LanguageProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
