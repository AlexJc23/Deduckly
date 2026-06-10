import { useEffect } from "react";
import { router } from "expo-router"
import { useAuth } from "../context/auth.context"


export function AuthGate() {
  const {
    isAuthenticated,
    isLoading,
  } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    if (isAuthenticated) {
      router.replace("../(tabs)/dashboard");
    } else {
      router.replace("../(auth)/login");
    }
  }, [isAuthenticated, isLoading]);

  return null;
}
