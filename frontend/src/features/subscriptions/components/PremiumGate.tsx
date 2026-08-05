import { ReactNode } from "react";

import { usePremium } from "../hooks/use-premium";

type PremiumGateProps = {
  children: ReactNode;
  fallback?: ReactNode;
};

export function PremiumGate({
  children,
  fallback = null,
}: PremiumGateProps) {
  const {
    isPremium,
    isLoading,
  } = usePremium();

  if (isLoading) {
    return null;
  }

  if (!isPremium) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}