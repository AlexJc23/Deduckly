import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
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


        <TrackingProvider>
          <SubscriptionProvider>
            <ThemeProvider value={DefaultTheme}>
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

              <StatusBar style="auto" />
            </ThemeProvider>
          </SubscriptionProvider>
        </TrackingProvider>
      </AuthProvider>
    </QueryProvider>
  );
}