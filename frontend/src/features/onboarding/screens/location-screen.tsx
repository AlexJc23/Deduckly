import { Platform } from "react-native";
import * as Location from "expo-location";
import { OnboardingScreen, OnboardingContent } from "../components/onboarding-screen";
import { useOnboarding } from "../hooks/use-onboarding";

const content: OnboardingContent = {
  label: "Mileage tracking",
  title: "Track Your Miles",
  description: "Record business trips manually or automatically during a shift.",
  icon: "navigate", symbol: "location.fill",
  action: "Continue",
  note: "Continue opens the location prompt. Background access is requested only when you start tracking.",
  features: [
    { title: "Manual trips", description: "Start and stop a trip when you drive.", icon: "map-outline", symbol: "map" },
    { title: "Shift tracking", description: "Start a shift to detect drives, including while the app is in the background.", icon: "folder-outline", symbol: "folder" },
  ],
};

export function LocationScreen({ onboarding }: { onboarding: ReturnType<typeof useOnboarding> }) {
  async function requestPermission() {
    let permission = await Location.getForegroundPermissionsAsync();
    if (!permission.granted && permission.status === "undetermined" && permission.canAskAgain) {
      permission = await Location.requestForegroundPermissionsAsync();
    }
    if (!permission.granted) {
      onboarding.setSettings(!permission.canAskAgain && Platform.OS !== "web");
      onboarding.setError("Location is off. You can enable it in your device settings or choose Not now to continue.");
      return false;
    }
    return true;
  }
  return <OnboardingScreen screen={content} onboarding={onboarding}
    onContinue={() => onboarding.runAction(requestPermission)}
    onSkip={() => onboarding.runAction()} />;
}
