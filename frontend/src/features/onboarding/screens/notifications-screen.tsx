import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import { useQueryClient } from "@tanstack/react-query";
import { updateCurrentUser } from "@/features/auth/api/user.api";
import { registerForPushNotifications } from "@/services/notifications";
import { OnboardingScreen, OnboardingContent } from "../components/onboarding-screen";
import { useOnboarding } from "../hooks/use-onboarding";

const content: OnboardingContent = {
  label: "Stay up to date",
  title: "Keep your work\nin focus.",
  description: "A busy day has enough moving parts. Let Deduckly help you stay on top of your trips and goals.",
  icon: "notifications", symbol: "bell.badge.fill",
  action: "Enable notifications",
  note: "Choose the reminders you want in Settings. Change them anytime.",
  features: [
    { title: "Stay on top of your trips", description: "Get reminders that help keep your records current.", icon: "car-outline", symbol: "car" },
    { title: "Keep your goals close", description: "Stay connected to the targets you set for yourself.", icon: "flag-outline", symbol: "flag" },
  ],
};

export function NotificationsScreen({ onboarding }: { onboarding: ReturnType<typeof useOnboarding> }) {
  const queryClient = useQueryClient();
  async function requestPermission() {
    if (Platform.OS === "web") {
      onboarding.setError("Push notifications are available in the Deduckly mobile app. Choose Not now to continue here.");
      return false;
    }
    const permission = await Notifications.getPermissionsAsync();
    if (!permission.granted && !permission.canAskAgain) {
      onboarding.setSettings(true);
      onboarding.setError("Notifications are off. Enable them in your device settings or choose Not now to continue.");
      return false;
    }
    await registerForPushNotifications();
    await updateCurrentUser({ notifications_enabled: true });
    await queryClient.invalidateQueries({ queryKey: ["current-user"] });
    return true;
  }
  return <OnboardingScreen screen={content} onboarding={onboarding}
    onContinue={() => onboarding.runAction(requestPermission,
      "We couldn’t finish setting up notifications. Please try again, or choose Not now and enable them later in Settings.")}
    onSkip={() => onboarding.runAction()} />;
}
