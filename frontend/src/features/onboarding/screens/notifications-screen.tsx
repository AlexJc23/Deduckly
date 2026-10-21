import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import { useQueryClient } from "@tanstack/react-query";
import { updateCurrentUser } from "@/features/auth/api/user.api";
import { registerForPushNotifications } from "@/services/notifications";
import { OnboardingScreen, OnboardingContent } from "../components/onboarding-screen";
import { useOnboarding } from "../hooks/use-onboarding";

const content: OnboardingContent = {
  label: "Stay up to date",
  title: "Stay Updated",
  description: "Get notifications about saved trips and shift reminders.",
  icon: "notifications", symbol: "bell.badge.fill",
  action: "Continue",
  note: "Continue opens the notification prompt. Notifications are optional.",
  features: [
    { title: "Trip updates", description: "Know when your trip records are saved.", icon: "car-outline", symbol: "car" },
    { title: "Shift reminders", description: "Stay informed about your planned shift end.", icon: "flag-outline", symbol: "flag" },
  ],
};

export function NotificationsScreen({ onboarding }: { onboarding: ReturnType<typeof useOnboarding> }) {
  const queryClient = useQueryClient();
  async function requestPermission() {
    if (Platform.OS === "web") {
      onboarding.setError("Push notifications are available in the Deduckly mobile app. Choose Not now to continue here.");
      return false;
    }
    let permission = await Notifications.getPermissionsAsync();
    if (!permission.granted && (permission.status === "denied" || !permission.canAskAgain)) {
      onboarding.setSettings(true);
      onboarding.setError("Notifications are off. Enable them in your device settings or choose Not now to continue.");
      return false;
    }
    if (!permission.granted) permission = await Notifications.requestPermissionsAsync();
    if (!permission.granted) return false;
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
