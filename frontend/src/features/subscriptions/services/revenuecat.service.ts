import Purchases, {
  CustomerInfo,
  PurchasesPackage,
} from "react-native-purchases";

import { ENV } from "@/config/env";

class RevenueCatService {
  async configure() {
    const apiKey = ENV.REVENUECAT_IOS_API_KEY;

    await Purchases.configure({
      apiKey,
    });
  }

  async logIn(userId: string) {
    const { customerInfo } =
      await Purchases.logIn(userId);

    return customerInfo;
  }

  async getOfferings() {
    return Purchases.getOfferings();
  }

  async purchasePackage(
    pkg: PurchasesPackage,
  ): Promise<CustomerInfo> {
    const before = await Purchases.getCustomerInfo();

    console.log(
      "RevenueCat purchase user:",
      before.originalAppUserId,
    );

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