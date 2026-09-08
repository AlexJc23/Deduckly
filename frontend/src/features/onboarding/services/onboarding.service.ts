import AsyncStorage from "@react-native-async-storage/async-storage";

export type OnboardingStep = 0 | 1 | 2 | 3 | 4;
const key = (userId: number) => `deduckly:onboarding:v2:${userId}`;

export async function getOnboardingStep(userId: number): Promise<OnboardingStep> {
  const value = await AsyncStorage.getItem(key(userId));
  if (value !== null) return value === "1" ? 1 : value === "2" ? 2 : value === "3" ? 3 : value === "4" ? 4 : 0;
  // v1 step 3 meant completed. Preserve completion; only unfinished users see goals.
  const legacy = await AsyncStorage.getItem(`deduckly:onboarding:v1:${userId}`);
  return legacy === "3" ? 4 : legacy === "2" ? 2 : legacy === "1" ? 1 : 0;
}

export async function saveOnboardingStep(userId: number, step: OnboardingStep) {
  await AsyncStorage.setItem(key(userId), String(step));
}
