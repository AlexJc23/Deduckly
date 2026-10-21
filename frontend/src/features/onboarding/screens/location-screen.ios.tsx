import * as Location from "expo-location";
import { IOSPermissionScreen } from "../components/ios-permission-screen";
import { type OnboardingContent } from "../components/onboarding-screen";
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
return <IOSPermissionScreen onboarding={onboarding} content={content} getPermission={Location.getForegroundPermissionsAsync} requestPermission={Location.requestForegroundPermissionsAsync} deniedMessage="Location access is required to record trip mileage. Open Settings to change location access, or continue setup without tracking." />;
}
