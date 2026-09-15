import * as Notifications from "expo-notifications";
import { IOSPermissionScreen } from "../components/ios-permission-screen";
import { type OnboardingContent } from "../components/onboarding-screen";
import { useOnboarding } from "../hooks/use-onboarding";
import { useQueryClient } from "@tanstack/react-query";
import { updateCurrentUser } from "@/features/auth/api/user.api";
import { registerForPushNotifications } from "@/services/notifications";
const content: OnboardingContent = {
  label: "Stay up to date",
  title: "Keep your work\nin focus.",
  description: "A busy day has enough moving parts. Let Deduckly help you stay on top of your trips and goals.",
  icon: "notifications", symbol: "bell.badge.fill",
  action: "Continue",
  note: "Choose the reminders you want in Settings. Change them anytime.",
  features: [
    { title: "Stay on top of your trips", description: "Get reminders that help keep your records current.", icon: "car-outline", symbol: "car" },
    { title: "Keep your goals close", description: "Stay connected to the targets you set for yourself.", icon: "flag-outline", symbol: "flag" },
  ],
};

export function NotificationsScreen({ onboarding }: { onboarding: ReturnType<typeof useOnboarding> }) {
const queryClient = useQueryClient();
return <IOSPermissionScreen onboarding={onboarding} content={content} getPermission={Notifications.getPermissionsAsync} requestPermission={Notifications.requestPermissionsAsync} deniedMessage="Notifications are off. Open Settings to change notification access, or continue without reminders." onGranted={async () => { await registerForPushNotifications(); await updateCurrentUser({ notifications_enabled: true }); await queryClient.invalidateQueries({ queryKey: ["current-user"] }); }} />;
}
