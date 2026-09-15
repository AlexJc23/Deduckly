import Purchases, { type PurchasesPackage } from "react-native-purchases";

// Supply the Google Play public SDK key later. Never fall back to Apple's key.
export const androidBillingConfigured = () => !!process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY?.trim();
let configuration: Promise<void> | undefined;
async function configure() {
  const apiKey = process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY?.trim();
  if (!apiKey) throw new Error("Android subscriptions are not configured yet.");
  if (!configuration) {
    configuration = Promise.resolve().then(() => { Purchases.configure({ apiKey }); })
      .catch(error => { configuration = undefined; throw error; });
  }
  return configuration;
}
export const revenueCatService = {
  configure,
  async logIn(userId: string) { await configure(); return (await Purchases.logIn(userId)).customerInfo; },
  async getOfferings() { await configure(); return Purchases.getOfferings(); },
  async purchasePackage(pkg: PurchasesPackage) { await configure(); return (await Purchases.purchasePackage(pkg)).customerInfo; },
  async restorePurchases() { await configure(); return Purchases.restorePurchases(); },
  async logOut() { if (configuration) { await configuration; await Purchases.logOut(); } },
};
