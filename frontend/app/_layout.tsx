import { AppThemeProvider } from "@/theme/theme";
import { Stack } from "expo-router";
import { NotificationSync } from "@/features/notifications/components/notification-sync";

import {
  AuthProvider,
} from "@features/auth/context/auth.context";
import { QueryProvider } from "@/providers/query.provider";
import "react-native-reanimated";
import { SubscriptionProvider } from "@/features/subscriptions/context/subscription.context";
import { TrackingProvider } from "@/features/tracking/context/tracking.context";

import { SiriStartup } from "../src/features/tracking/components/SiriStartup";
import { useTripSync } from "@/features/trips/hooks/use-trip-sync";

export const unstable_settings = {
  anchor: "(tabs)",
};



export default function RootLayout() {
  useTripSync();
  
  return (
    <QueryProvider>
      <AuthProvider>
        <NotificationSync />


        <TrackingProvider>
          <SubscriptionProvider>
            <AppThemeProvider>
              <SiriStartup />

              <Stack
                screenOptions={{
                  headerShown: false,
                }}
              >
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="(auth)" />

                <Stack.Screen
                  name="modals"
                  options={{
                    presentation: "modal",
                  }}
                />
              </Stack>


            </AppThemeProvider>
          </SubscriptionProvider>
        </TrackingProvider>
      </AuthProvider>
    </QueryProvider>
  );
}