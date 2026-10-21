import { OnboardingScreen, OnboardingContent } from "../components/onboarding-screen";
import { useOnboarding } from "../hooks/use-onboarding";

const content: OnboardingContent = {
  label: "You’re ready",
  title: "You're All Set!",
  description: "Start tracking your mileage and earnings with Deduckly.",
  icon: "checkmark", symbol: "checkmark",
  action: "Go to Dashboard",
  note: "Your next trip. Your next goal. Start here.",
  features: [],
};

export function WelcomeScreen({ onboarding }: { onboarding: ReturnType<typeof useOnboarding> }) {
  return <OnboardingScreen screen={content} onboarding={onboarding}
    onContinue={() => onboarding.runAction()} />;
}
