import { useQuery } from "@tanstack/react-query";

import { revenueCatService } from "../services/revenuecat.service";

export function useOfferings() {
  return useQuery({
    queryKey: ["offerings"],
    queryFn: () =>
      revenueCatService.getOfferings(),
  });
}