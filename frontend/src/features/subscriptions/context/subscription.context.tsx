import {
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
} from "react";

import Purchases from "react-native-purchases";
import { useQueryClient } from "@tanstack/react-query";

type SubscriptionContextType = {};

const SubscriptionContext =
  createContext<SubscriptionContextType>({});

export function SubscriptionProvider({
  children,
}: PropsWithChildren) {
  const queryClient = useQueryClient();

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