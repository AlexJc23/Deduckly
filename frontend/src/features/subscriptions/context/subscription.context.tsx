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
    if (!user?.id) {
      return;
    }

    const setupRevenueCat = async () => {
      try {
        await revenueCatService.configure();

        const customerInfo =
          await revenueCatService.logIn(
            String(user.id),
          );

        console.log(
          "RevenueCat logged in as:",
          user.id,
        );

        console.log(
          "RevenueCat customer:",
          customerInfo.originalAppUserId,
        );
      } catch (error) {
        console.error(
          "RevenueCat setup failed:",
          error,
        );
      }
    };

    setupRevenueCat();
  }, [user?.id]);

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