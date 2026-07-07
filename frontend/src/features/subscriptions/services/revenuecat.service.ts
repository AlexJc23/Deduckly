import Purchases from "react-native-purchases";
import { ENV } from "@/config/env";

export async function initializeRevenueCat() {
  await Purchases.configure({
    apiKey: ENV.REVENUECAT_API_KEY,
  });
}
