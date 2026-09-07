import { Pressable, Text, View } from "@/theme/components";
import { PropsWithChildren, useEffect, useState } from "react";
import { ActivityIndicator } from "react-native";
import { Redirect } from "expo-router";
import { useAuth } from "@/features/auth/context/auth.context";
import { getCurrentUser } from "@/features/auth/api/auth.api";
import { getOnboardingStep } from "../services/onboarding.service";

export function OnboardingGate({ children }: PropsWithChildren) {
  const { isAuthenticated, isLoading, signOut } = useAuth();
  const [status, setStatus] = useState<"loading" | "ready" | "onboarding" | "error">("loading");
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    if (isLoading || !isAuthenticated) return;
    setStatus("loading");
    getCurrentUser().then(async user => {
      const step = await getOnboardingStep(user.id);
      if (active) setStatus(step === 3 ? "ready" : "onboarding");
    }).catch(() => { if (active) setStatus("error"); });
    return () => { active = false; };
  }, [isAuthenticated, isLoading, attempt]);
  if (!isLoading && !isAuthenticated) return <Redirect href="/(auth)/login" />;
  if (status === "onboarding") return <Redirect href="/onboarding" />;
  if (status === "ready" && !isLoading) return <>{children}</>;
  return <View style={{ flex: 1, backgroundColor: "#F7F9FC", alignItems: "center", justifyContent: "center", gap: 20 }}>
    {status === "error" ? <>
      <Text>We couldn’t load your account. Please try again.</Text>
      <Pressable accessibilityRole="button" onPress={() => setAttempt(a => a + 1)}><Text style={{ color: "#0072B5" }}>Try again</Text></Pressable>
      <Pressable accessibilityRole="button" onPress={signOut}><Text>Sign out</Text></Pressable>
    </> : <ActivityIndicator color="#0072B5" accessibilityLabel="Loading your account" />}
  </View>;
}
