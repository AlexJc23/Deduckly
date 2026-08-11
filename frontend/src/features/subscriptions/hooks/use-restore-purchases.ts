import { useMutation } from "@tanstack/react-query";

import { revenueCatService } from "../services/revenuecat.service";

export function useRestorePurchases() {
  return useMutation({
    mutationFn: () =>
      revenueCatService.restorePurchases(),
  });
}