import { useEffect, useRef, useState } from "react";
import { router } from "expo-router";
import { useAuth } from "@/features/auth/context/auth.context";
import { getCurrentUser } from "@/features/auth/api/auth.api";
import { getOnboardingStep, saveOnboardingStep, OnboardingStep } from "../services/onboarding.service";

export function useOnboarding() {
  const { isAuthenticated, isLoading, signOut } = useAuth();
  const [userId, setUserId] = useState<number>();
  const [initialGoals, setInitialGoals] = useState({ daily: "", monthly: "", currency: "USD" });
  const [step, setStep] = useState<OnboardingStep>(0);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const locked = useRef(false);
  const [error, setError] = useState("");
  const [settings, setSettings] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    if (isLoading || !isAuthenticated) return;
    setLoading(true);
    setError("");
    getCurrentUser().then(async user => {
      const saved = await getOnboardingStep(user.id);
      if (active) { setUserId(user.id); setStep(saved); setInitialGoals({ daily: String(user.daily_income_goal ?? ""), monthly: String(user.monthly_income_goal ?? ""), currency: user.currency || "USD" }); }
    }).catch(() => { if (active) setError("We couldn’t load your account. Please try again."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [isLoading, isAuthenticated, attempt]);


  async function advance() {
    if (userId === undefined) return;
    const next = (step + 1) as OnboardingStep;
    await saveOnboardingStep(userId, next);
    setSettings(false);
    setStep(next);
    if (next === 4) router.replace("/(tabs)/dashboard");
  }

  async function runAction(action?: () => Promise<boolean>, failureMessage = "We couldn’t save this step. Please try again.") {
    if (locked.current || userId === undefined) return;
    locked.current = true;
    setBusy(true);
    setError("");
    setSettings(false);
    try {
      if (action && !(await action())) return;
      await advance();
    } catch {
      setError(failureMessage);
    } finally {
      locked.current = false;
      setBusy(false);
    }
  }

  return { initialGoals, isAuthenticated, isLoading, signOut, userId, step, loading, busy, error,
    settings, setSettings, setError, runAction, retry: () => setAttempt(a => a + 1) };
}
