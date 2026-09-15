import { useEffect, useState } from "react";
import { AppState } from "react-native";
import { Stack } from "expo-router";
import { OnboardingScreen, type OnboardingContent } from "./onboarding-screen";
import { useOnboarding } from "../hooks/use-onboarding";

type Permission = { granted: boolean; status: string; canAskAgain: boolean };
type Props = {
  onboarding: ReturnType<typeof useOnboarding>;
  content: OnboardingContent;
  getPermission: () => Promise<Permission>;
  requestPermission: () => Promise<Permission>;
  deniedMessage: string;
  onGranted?: () => Promise<void>;
};

// The explanatory state has one action. Only the system dialog offers consent choices.
export function IOSPermissionScreen({ onboarding, content, getPermission, requestPermission, deniedMessage, onGranted }: Props) {
  const [permission, setPermission] = useState<Permission | null>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let active = true;
    const refresh = () => { void getPermission().then(value => {
      if (active) { setPermission(value); setFailed(false); }
    }).catch(() => { if (active) setFailed(true); }); };
    refresh();
    const subscription = AppState.addEventListener("change", state => { if (state === "active") refresh(); });
    return () => { active = false; subscription.remove(); };
  }, [getPermission]);
  const denied = !!permission && !permission.granted && (permission.status === "denied" || !permission.canAskAgain);
  const recovery = denied || failed;
  const screen = { ...content, action: recovery ? "Continue without access" : "Continue",
    ...(recovery ? { title: "Permission settings", description: failed ? "We couldn’t check device permissions. You can continue setup and try this feature later." : deniedMessage,
      features: [], note: "You can change permissions in Settings at any time." } : {}) };
  async function proceed() {
    if (recovery) return true;
    // Re-read after returning from Settings; never turn a denial into another prompt.
    let current = await getPermission();
    if (!current.granted && current.status === "undetermined" && current.canAskAgain) {
      current = await requestPermission();
    }
    setPermission(current);
    if (!current.granted) return false;
    try { await onGranted?.(); }
    catch { setFailed(true); throw new Error("Permission granted but setup failed"); }
    return true;
  }
  return <>
    <Stack.Screen options={{ gestureEnabled: false, headerBackVisible: false }} />
    <OnboardingScreen screen={screen} onboarding={{ ...onboarding,
      loading: onboarding.loading || (!permission && !failed), settings: denied,
    }} onContinue={() => onboarding.runAction(proceed, "We couldn’t finish setup. You can continue and try again in Settings.")} />
  </>;
}
