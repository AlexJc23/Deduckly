import * as Location from "expo-location";
import { IOSPermissionScreen } from "../components/ios-permission-screen";
import { type OnboardingContent } from "../components/onboarding-screen";
import { useOnboarding } from "../hooks/use-onboarding";
const content: OnboardingContent = {
  label: "Mileage tracking",
  title: "Your miles.\nWorking for you.",
  description: "Keep a clear record of the miles you put into your work. Deduckly handles the tracking, so you can focus on the road ahead.",
  icon: "navigate", symbol: "location.fill",
  action: "Continue",
  note: "Location is used for trips you start. Automatic tracking stays off.",
  features: [
    { title: "Every trip, accounted for", description: "Use GPS to record your route and mileage.", icon: "map-outline", symbol: "map" },
    { title: "Ready when you need it", description: "Keep your work miles organized in one place.", icon: "folder-outline", symbol: "folder" },
  ],
};

export function LocationScreen({ onboarding }: { onboarding: ReturnType<typeof useOnboarding> }) {
return <IOSPermissionScreen onboarding={onboarding} content={content} getPermission={Location.getForegroundPermissionsAsync} requestPermission={Location.requestForegroundPermissionsAsync} deniedMessage="Location access is required to record trip mileage. Open Settings to change location access, or continue setup without tracking." />;
}
