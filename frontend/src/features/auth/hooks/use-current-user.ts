import { getAccountGeneration } from "../services/account-boundary";
import { useAuth } from "../context/auth.context";
import { useQuery } from "@tanstack/react-query";
import { getCurrentUser } from "../api/auth.api";


export function useCurrentUser() {
  const { isAuthenticated, isLoading } = useAuth();
  return useQuery({
    enabled: isAuthenticated && !isLoading,
    queryKey: ["current-user", getAccountGeneration()],
    queryFn: getCurrentUser,
  });
};


