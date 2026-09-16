import { ENV } from "@/config/env";
import { createAccountBilling } from "./account-billing";
export const revenueCatService = createAccountBilling(() => ENV.REVENUECAT_IOS_API_KEY);
