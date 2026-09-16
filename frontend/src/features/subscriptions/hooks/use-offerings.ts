import { useSubscription } from "../context/subscription.context";
import { useQuery } from "@tanstack/react-query";

import { revenueCatService } from "../services/revenuecat.service";

export function useOfferings() {
  const { isIdentityReady, generation } = useSubscription();
  return useQuery({
    enabled: isIdentityReady,
    queryKey: ["offerings", generation],
    queryFn: () =>
      revenueCatService.getOfferings(),
  });
}