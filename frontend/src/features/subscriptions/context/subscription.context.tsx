import {
  createContext,
  useContext,
  useState,
} from "react";

type SubscriptionContextType = {
  isPremium: boolean;
  setPremium: (
    value: boolean
  ) => void;
};

const SubscriptionContext =
  createContext<
    SubscriptionContextType | undefined
  >(undefined);

export function SubscriptionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isPremium, setPremium] =
    useState(false);

  return (
    <SubscriptionContext.Provider
      value={{
        isPremium,
        setPremium,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context =
    useContext(
      SubscriptionContext
    );

  if (!context) {
    throw new Error(
      "SubscriptionContext missing"
    );
  }

  return context;
}
