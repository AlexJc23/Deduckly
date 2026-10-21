import * as Notifications from "expo-notifications";
import { IOSPermissionScreen } from "../components/ios-permission-screen";
import { type OnboardingContent } from "../components/onboarding-screen";
import { useOnboarding } from "../hooks/use-onboarding";
import { useQueryClient } from "@tanstack/react-query";
import { updateCurrentUser } from "@/features/auth/api/user.api";
import { registerForPushNotifications } from "@/services/notifications";
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
return <IOSPermissionScreen optional onboarding={onboarding} content={content} getPermission={Notifications.getPermissionsAsync} requestPermission={Notifications.requestPermissionsAsync} deniedMessage="Notifications are off. Open Settings to change notification access, or continue without reminders." onGranted={async () => { await registerForPushNotifications(); await updateCurrentUser({ notifications_enabled: true }); await queryClient.invalidateQueries({ queryKey: ["current-user"] }); }} />;
}
