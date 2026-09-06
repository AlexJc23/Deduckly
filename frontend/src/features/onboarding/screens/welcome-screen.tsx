import { OnboardingScreen, OnboardingContent } from "../components/onboarding-screen";
import { useOnboarding } from "../hooks/use-onboarding";

const content: OnboardingContent = {
  label: "You’re ready",
  title: "Welcome to\nDeduckly.",
  description: "You do the work. Make more of it with your miles, earnings, and expenses together in one place.",
  icon: "checkmark", symbol: "checkmark",
  action: "Start using Deduckly",
  note: "Your next trip. Your next goal. Start here.",
  features: [
    { title: "A clearer view of your earnings", description: "Bring your income and expenses into focus.", icon: "bar-chart-outline", symbol: "chart.bar" },
    { title: "Less time sorting things out", description: "Keep your trips and work records together.", icon: "documents-outline", symbol: "doc.on.doc" },
    { title: "Know where you stand", description: "Follow your progress with reports and goals.", icon: "trending-up-outline", symbol: "chart.line.uptrend.xyaxis" },
  ],
};

export function WelcomeScreen({ onboarding }: { onboarding: ReturnType<typeof useOnboarding> }) {
  return <OnboardingScreen screen={content} onboarding={onboarding}
    onContinue={() => onboarding.runAction()} />;
}
