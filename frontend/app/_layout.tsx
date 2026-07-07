import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from "@features/auth/context/auth.context";
import { QueryProvider } from '@/providers/query.provider';
import 'react-native-reanimated';
import { SubscriptionProvider } from '@/features/subscriptions/context/subscription.context';
import { TrackingProvider } from '@/features/tracking/context/tracking.context';

// import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};


export default function RootLayout() {
  return (
    <QueryProvider>
      <AuthProvider>
        <TrackingProvider>
          <SubscriptionProvider>
            <ThemeProvider value={DefaultTheme}>
                <StatusBar style="auto" />
                <Stack screenOptions={{ headerShown: false }}>
                  <Stack.Screen name="(tabs)" />
                  <Stack.Screen name="(auth)" />
                  <Stack.Screen
                    name="modals"
                    options={{ presentation: "modal" }}
                    />
              </Stack>
            </ThemeProvider>
          </SubscriptionProvider>
        </TrackingProvider>
      </AuthProvider>
    </QueryProvider>
  );
}
