import { type PropsWithChildren, useEffect, useSyncExternalStore } from "react";
import Purchases from "react-native-purchases";
import { useQueryClient } from "@tanstack/react-query";
import { useCurrentUser } from "@/features/auth/hooks/use-current-user";
import { useAuth } from "@/features/auth/context/auth.context";
import { getAccountGeneration } from "@/features/auth/services/account-boundary";
import { revenueCatService } from "../services/revenuecat.service";

export function SubscriptionProvider({ children }: PropsWithChildren) {
  const { isAuthenticated, isLoading } = useAuth();
  const { data: user } = useCurrentUser();
  const queryClient = useQueryClient();
  const userId = !isLoading && isAuthenticated && user?.id ? String(user.id) : null;
  const generation = getAccountGeneration();
  useEffect(() => {
    if (!userId) return;
    let active = true;
    const listener = () => {
      if (active && revenueCatService.getSnapshot().ready && generation === getAccountGeneration()) {
        void queryClient.invalidateQueries({ queryKey: ["current-user"] });
      }
    };
    void revenueCatService.logIn(userId).then(() => {
      if (active) Purchases.addCustomerInfoUpdateListener(listener);
    }).catch(() => { console.warn("Subscription account unavailable; purchases remain disabled."); });
    return () => { active = false; Purchases.removeCustomerInfoUpdateListener(listener); };
  }, [userId, generation, queryClient]);
  return <>{children}</>;
}
export function useSubscription() {
  const { isAuthenticated, isLoading } = useAuth();
  const { data: user } = useCurrentUser();
  const state = useSyncExternalStore(revenueCatService.subscribe, revenueCatService.getSnapshot, revenueCatService.getSnapshot);
  return { isIdentityReady: !isLoading && isAuthenticated && state.ready && state.userId === String(user?.id) && state.generation === getAccountGeneration(), generation: state.generation };
}
