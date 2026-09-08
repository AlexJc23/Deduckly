import { useLanguage, Translated } from "@/i18n/language";
import { useState } from "react";
import { Keyboard, KeyboardAvoidingView, Platform, StyleSheet } from "react-native";
import { useQueryClient } from "@tanstack/react-query";
import { Text, TextInput, View } from "@/theme/components";
import { updateCurrentUser } from "@/features/auth/api/user.api";
import { OnboardingScreen, type OnboardingContent } from "../components/onboarding-screen";
import { useOnboarding } from "../hooks/use-onboarding";
import { parseGoalInput } from "../utils/goal-input";

const content: OnboardingContent = {
  label: "Set your goals",
  title: "Make every day count.",
  description: "Choose daily and monthly income goals that work for you. You can change them anytime in Preferences.",
  icon: "flag-outline", symbol: "flag",
  action: "Save goals and continue",
  note: "Your goals are personal targets, not guaranteed earnings.",
  features: [],
};

export function GoalsScreen({ onboarding }: { onboarding: ReturnType<typeof useOnboarding> }) {
  useLanguage();
  const [daily, setDaily] = useState(onboarding.initialGoals.daily);
  const [monthly, setMonthly] = useState(onboarding.initialGoals.monthly);
  const queryClient = useQueryClient();

  function save() {
    Keyboard.dismiss();
    let dailyGoal: string | null, monthlyGoal: string | null;
    try { dailyGoal = parseGoalInput(daily); monthlyGoal = parseGoalInput(monthly); }
    catch { onboarding.setError("Enter a positive amount with up to two decimal places."); return; }
    void onboarding.runAction(async () => {
      // Only supplied goals are updated. Skip/empty input never clears existing goals.
      if (dailyGoal !== null || monthlyGoal !== null) {
        await updateCurrentUser({
          ...(dailyGoal !== null ? { daily_income_goal: dailyGoal } : {}),
          ...(monthlyGoal !== null ? { monthly_income_goal: monthlyGoal } : {}),
        });
        await queryClient.invalidateQueries({ queryKey: ["current-user"] });
      }
      return true;
    }, "We couldn’t save your goals. Check your connection and try again.");
  }

  return <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : "height"}>
    <OnboardingScreen screen={content} onboarding={onboarding} onContinue={save}
      onSkip={() => { Keyboard.dismiss(); void onboarding.runAction(); }}>
      <View style={styles.fields}>
        <View style={styles.field}>
          <Text style={styles.label}><Translated text="Daily income goal" /> · {onboarding.initialGoals.currency}</Text>
          <Text style={styles.helper}><Translated text="Set a goal for each workday." /></Text>
          <TextInput accessibilityLabel="Daily income goal" value={daily} onChangeText={setDaily} keyboardType="decimal-pad" placeholder="150" editable={!onboarding.busy} style={styles.input} />
        </View>
        <View style={styles.field}>
          <Text style={styles.label}><Translated text="Monthly income goal" /> · {onboarding.initialGoals.currency}</Text>
          <Text style={styles.helper}><Translated text="Set a goal for the whole month." /></Text>
          <TextInput accessibilityLabel="Monthly income goal" value={monthly} onChangeText={setMonthly} keyboardType="decimal-pad" placeholder="3000" editable={!onboarding.busy} style={styles.input} />
        </View>
      </View>
    </OnboardingScreen>
  </KeyboardAvoidingView>;
}
const styles = StyleSheet.create({
  container: { flex: 1 }, fields: { width: "100%", gap: 20, paddingVertical: 16 }, field: { gap: 8 },
  label: { fontSize: 16, fontWeight: "600", color: "#273449" },
  helper: { fontSize: 14, lineHeight: 20, color: "#647184" },
  input: { minHeight: 54, borderWidth: 1, borderColor: "#DDE3EA", borderRadius: 14, backgroundColor: "#FFFFFF", padding: 14, fontSize: 18, color: "#273449" },
});
