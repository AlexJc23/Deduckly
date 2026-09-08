import { GoalsScreen } from "@/features/onboarding/screens/goals-screen";
import { Redirect } from "expo-router";
import { useOnboarding } from "@/features/onboarding/hooks/use-onboarding";
import { LocationScreen } from "@/features/onboarding/screens/location-screen";
import { NotificationsScreen } from "@/features/onboarding/screens/notifications-screen";
import { WelcomeScreen } from "@/features/onboarding/screens/welcome-screen";

export default function Onboarding() {
  const onboarding = useOnboarding();
  if (!onboarding.isLoading && !onboarding.isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }
  switch (onboarding.step) {
    case 1:
      return <NotificationsScreen onboarding={onboarding} />;
    case 2:
      return <GoalsScreen onboarding={onboarding} />;
    case 3:
      return <WelcomeScreen onboarding={onboarding} />;
    case 4:
      return <Redirect href="/(tabs)/dashboard" />;
    default:
      return <LocationScreen onboarding={onboarding} />;
  }
}
