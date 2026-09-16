import { createAccountBilling } from "./account-billing";
export const androidBillingConfigured = () => !!process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY?.trim();
export const revenueCatService = createAccountBilling(() => process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY);
