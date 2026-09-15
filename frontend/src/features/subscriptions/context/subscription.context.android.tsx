import { type PropsWithChildren, useEffect } from "react";
import Purchases from "react-native-purchases";
import { useQueryClient } from "@tanstack/react-query";
import { useCurrentUser } from "@/features/auth/hooks/use-current-user";
import { useAuth } from "@/features/auth/context/auth.context";
import { androidBillingConfigured, revenueCatService } from "../services/revenuecat.service.android";

export function SubscriptionProvider({ children }: PropsWithChildren) {
  const { isAuthenticated, isLoading } = useAuth();
  // Keep the SDK and its account query out of startup until Android is configured.
  return <>{androidBillingConfigured() && !isLoading && isAuthenticated && <AndroidSubscriptionSession />}{children}</>;
}
function AndroidSubscriptionSession() {
  const { data: user } = useCurrentUser();
  const queryClient = useQueryClient();
  useEffect(() => {
    if (!user?.id) return;
    let active = true;
    const listener = () => { if (active) void queryClient.invalidateQueries({ queryKey: ["current-user"] }); };
    void revenueCatService.logIn(String(user.id)).then(() => {
      if (active) Purchases.addCustomerInfoUpdateListener(listener);
    }).catch(() => { console.warn("Android billing is unavailable; other features remain available."); });
    return () => { active = false; Purchases.removeCustomerInfoUpdateListener(listener); };
  }, [user?.id, queryClient]);
  return null;
}
export function useSubscription() { return {}; }
