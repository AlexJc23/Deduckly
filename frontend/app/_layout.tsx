import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from "@features/auth/context/auth.context";
import { QueryProvider } from '@/providers/query.provider';
import 'react-native-reanimated';
import { SubscriptionProvider } from '@/features/subscriptions/context/subscription.context';
import { TrackingProvider } from '@/features/tracking/context/tracking.context';
import { Linking } from "react-native";
import { useEffect } from "react";
import { SiriStartup } from '../src/features/tracking/components/SiriStartup';

// import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};


export default function RootLayout() {

  useEffect(() => {
    const handleUrl = ({ url }: { url: string }) => {
      console.log("🔥 Siri URL:", url);
    };

    const subscription = Linking.addEventListener("url", handleUrl);

    Linking.getInitialURL().then((url) => {
      if (url) {
        console.log("🔥 Initial URL:", url);
      }
    });

    return () => subscription.remove();
  }, []);
  return (
    <QueryProvider>
      <AuthProvider>
        <TrackingProvider>
          <SubscriptionProvider>
            <ThemeProvider value={DefaultTheme}>
              <SiriStartup />

              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="(auth)" />
                <Stack.Screen
                  name="modals"
                  options={{ presentation: "modal" }}
                />
              </Stack>

              <StatusBar style="auto" />
            </ThemeProvider>
          </SubscriptionProvider>
        </TrackingProvider>
      </AuthProvider>
    </QueryProvider>
  );
}
