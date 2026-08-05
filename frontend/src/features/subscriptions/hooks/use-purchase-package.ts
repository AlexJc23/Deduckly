import { useMutation } from "@tanstack/react-query";

import { revenueCatService } from "../services/revenuecat.service";

export function usePurchasePackage() {
  return useMutation({
    mutationFn: revenueCatService.purchasePackage,
  });
}