import AsyncStorage from "@react-native-async-storage/async-storage";

export type OnboardingStep = 0 | 1 | 2 | 3;
const key = (userId: number) => `deduckly:onboarding:v1:${userId}`;

export async function getOnboardingStep(userId: number): Promise<OnboardingStep> {
  const value = await AsyncStorage.getItem(key(userId));
  return value === "1" ? 1 : value === "2" ? 2 : value === "3" ? 3 : 0;
}

export async function saveOnboardingStep(userId: number, step: OnboardingStep) {
  await AsyncStorage.setItem(key(userId), String(step));
}
