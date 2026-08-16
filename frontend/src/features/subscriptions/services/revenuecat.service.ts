import Purchases, {
  CustomerInfo,
  PurchasesPackage,
} from "react-native-purchases";

import Constants, {
  ExecutionEnvironment,
} from "expo-constants";

import { ENV } from "@/config/env";

class RevenueCatService {
  async configure(userId: string) {
    const apiKey =
      Constants.executionEnvironment ===
      ExecutionEnvironment.StoreClient
        ? ENV.REVENUECAT_TEST_API_KEY
        : ENV.REVENUECAT_IOS_API_KEY;

    await Purchases.configure({
      apiKey,
      appUserID: userId,
    });
  }

  async getOfferings() {
    const offerings = await Purchases.getOfferings();

    return offerings;
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