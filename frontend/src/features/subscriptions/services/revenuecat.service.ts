import Purchases, {
  CustomerInfo,
  PurchasesPackage,
} from "react-native-purchases";

import { ENV } from "@/config/env";

class RevenueCatService {
  async configure(userId: string) {
    await Purchases.configure({
      apiKey: ENV.REVENUECAT_IOS_API_KEY,
      appUserID: userId,
    });
  }

  async getOfferings() {
    return null;
  }

  async purchasePackage(
    pkg: PurchasesPackage,
  ): Promise<CustomerInfo> {
    const { customerInfo } =
      await Purchases.purchasePackage(pkg);

    return customerInfo;
  }

  async restorePurchases() {
    return Purchases.restorePurchases();
  }

  async logOut() {
    await Purchases.logOut();
  }
}

export const revenueCatService =
  new RevenueCatService();