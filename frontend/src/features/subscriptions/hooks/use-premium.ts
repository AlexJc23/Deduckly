import { useCurrentUser } from "@/features/auth/hooks/use-current-user";

export function usePremium() {
  const { data: user, ...rest } = useCurrentUser();

  return {
    ...rest,
    isPremium: user?.is_premium ?? false,
  };
}