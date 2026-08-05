import {
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
} from "react";

import Purchases from "react-native-purchases";
import { useQueryClient } from "@tanstack/react-query";

import { useCurrentUser } from "@/features/auth/hooks/use-current-user";
import { revenueCatService } from "../services/revenuecat.service";

type SubscriptionContextType = {};

const SubscriptionContext =
  createContext<SubscriptionContextType>({});

export function SubscriptionProvider({
  children,
}: PropsWithChildren) {
  const queryClient = useQueryClient();

  const { data: user } = useCurrentUser();

  useEffect(() => {
    if (!user) {
      return;
    }

    revenueCatService.configure(
      user.id.toString(),
    );
  }, [user]);

  useEffect(() => {
    const listener = async () => {
      await queryClient.invalidateQueries({
        queryKey: ["current-user"],
      });
    };

    Purchases.addCustomerInfoUpdateListener(
      listener,
    );

    return () => {
      Purchases.removeCustomerInfoUpdateListener(
        listener,
      );
    };
  }, [queryClient]);

  return (
    <SubscriptionContext.Provider value={{}}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  return useContext(
    SubscriptionContext,
  );
}