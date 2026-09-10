import { useLanguage, Translated } from "@/i18n/language";
import { Pressable, Text, View } from "@/theme/components";
import { PropsWithChildren, useEffect, useState } from "react";
import { ActivityIndicator, AppState } from "react-native";
import NetInfo from "@react-native-community/netinfo";
import { Redirect } from "expo-router";
import { useAuth } from "@/features/auth/context/auth.context";
import { resolveAppAccess, OfflineSetupRequired, type AppAccess } from "../services/app-access.service";
import { OfflineTripAccess } from "./offline-trip-access";

export function OnboardingGate({ children }: PropsWithChildren) {
  useLanguage();
  const { isAuthenticated, isLoading, signOut } = useAuth();
  const [status, setStatus] = useState<AppAccess | "loading" | "error">("loading");
  const [message, setMessage] = useState("We couldn’t load your account. Please try again.");
  const [attempt, setAttempt] = useState(0);
  const [checking, setChecking] = useState(false);
  useEffect(() => {
    if (isLoading || !isAuthenticated) return;
    let active = true;
    let request = 0;
    let previousOffline: boolean | undefined;
    let forceProbe = attempt > 0;
    async function check(offline: boolean) {
      const currentRequest = ++request;
      setChecking(true);
      try {
        const next = await resolveAppAccess(offline);
        if (active && currentRequest === request && next !== "stale") setStatus(next);
      } catch (error) {
        if (active && currentRequest === request) {
          setMessage(error instanceof OfflineSetupRequired
            ? "Connect to the internet to finish setting up your account on this device. Once setup is complete, you can track trips offline."
            : "We couldn’t load your account. Please try again.");
          setStatus("error");
        }
      } finally { if (active && currentRequest === request) setChecking(false); }
    }
    // NetInfo delivers its current state on subscription, then connectivity changes.
    const unsubscribe = NetInfo.addEventListener(state => {
      const offline = state.isConnected === false || state.isInternetReachable === false;
      if (previousOffline === offline) return;
      previousOffline = offline;
      // Manual retry probes our API even if the system reachability check is stale.
      const probeOffline = forceProbe ? false : offline;
      forceProbe = false;
      void check(probeOffline);
    });
    const appState = AppState.addEventListener("change", state => {
      if (state === "active") {
        void NetInfo.fetch().then(network => {
          if (active) void check(network.isConnected === false || network.isInternetReachable === false);
        }).catch(() => { if (active) void check(false); });
      }
    });
    return () => { active = false; request++; unsubscribe(); appState.remove(); };
  }, [isAuthenticated, isLoading, attempt]);
  if (!isLoading && (!isAuthenticated || status === "login")) return <Redirect href="/(auth)/login" />;
  if (status === "onboarding") return <Redirect href="/onboarding" />;
  if (status === "ready" && !isLoading) return <>{children}</>;
  if (status === "offline" && !isLoading) return <OfflineTripAccess checking={checking} onRetry={() => setAttempt(a => a + 1)} />;
  return <View style={{ flex: 1, backgroundColor: "#F7F9FC", alignItems: "center", justifyContent: "center", gap: 20, padding: 24 }}>
    {status === "error" ? <>
      <Text style={{ maxWidth: 520, textAlign: "center", lineHeight: 24 }}><Translated text={message} /></Text>
      <Pressable accessibilityRole="button" disabled={checking} onPress={() => setAttempt(a => a + 1)} style={{ padding: 14 }}><Text style={{ color: "#0072B5" }}><Translated text={checking ? "Checking connection…" : "Try again"} /></Text></Pressable>
      <Pressable accessibilityRole="button" onPress={signOut} style={{ padding: 14 }}><Text><Translated text="Sign out" /></Text></Pressable>
    </> : <ActivityIndicator color="#0072B5" accessibilityLabel="Loading your account" />}
  </View>;
}
