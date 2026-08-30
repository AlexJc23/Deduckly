import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack, router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  AuthProvider,
  useAuth,
} from "@features/auth/context/auth.context";
import { QueryProvider } from "@/providers/query.provider";
import "react-native-reanimated";
import { SubscriptionProvider } from "@/features/subscriptions/context/subscription.context";
import { TrackingProvider } from "@/features/tracking/context/tracking.context";
import { Linking } from "react-native";
import { useEffect } from "react";
import { SiriStartup } from "../src/features/tracking/components/SiriStartup";
import { saveTokens } from "@/features/auth/services/auth-service.service";

export const unstable_settings = {
  anchor: "(tabs)",
};

function OAuthListener() {
  const { signIn } = useAuth();

  useEffect(() => {
    const handleUrl = async (url: string | null) => {
      if (!url) {
        return;
      }

      if (!url.startsWith("deduckly://oauth/callback")) {
        return;
      }

      try {
        const parsed = new URL(url);

        const accessToken =
          parsed.searchParams.get("access_token");

        const refreshToken =
          parsed.searchParams.get("refresh_token");

        if (!accessToken || !refreshToken) {
          return;
        }

        await saveTokens(
          accessToken,
          refreshToken
        );

        signIn();

        router.replace("/(tabs)/dashboard");
      } catch {
        return;
      }
    };

    const subscription = Linking.addEventListener(
      "url",
      ({ url }) => {
        handleUrl(url);
      }
    );

    Linking.getInitialURL()
      .then((url) => {
        handleUrl(url);
      })
      .catch(() => {
        return;
      });

    return () => {
      subscription.remove();
    };
  }, [signIn]);

  return null;
}

export default function RootLayout() {
  return (
    <QueryProvider>
      <AuthProvider>
        <OAuthListener />

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