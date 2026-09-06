import { Platform } from "react-native";
import * as Location from "expo-location";
import { OnboardingScreen, OnboardingContent } from "../components/onboarding-screen";
import { useOnboarding } from "../hooks/use-onboarding";

const content: OnboardingContent = {
  label: "Mileage tracking",
  title: "Your miles.\nWorking for you.",
  description: "Keep a clear record of the miles you put into your work. Deduckly handles the tracking, so you can focus on the road ahead.",
  icon: "navigate", symbol: "location.fill",
  action: "Enable location",
  note: "Location is used for trips you start. Automatic tracking stays off.",
  features: [
    { title: "Every trip, accounted for", description: "Use GPS to record your route and mileage.", icon: "map-outline", symbol: "map" },
    { title: "Ready when you need it", description: "Keep your work miles organized in one place.", icon: "folder-outline", symbol: "folder" },
  ],
};

export function LocationScreen({ onboarding }: { onboarding: ReturnType<typeof useOnboarding> }) {
  async function requestPermission() {
    let permission = await Location.getForegroundPermissionsAsync();
    if (!permission.granted && permission.canAskAgain) {
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
