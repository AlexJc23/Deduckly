import { useEffect } from "react";
import { AppState } from "react-native";
import { useAuth } from "@/features/auth/context/auth.context";
import { syncNotificationRegistration } from "@/services/notifications";

export function NotificationSync() {
  const { isAuthenticated, isLoading } = useAuth();
  useEffect(() => {
    if (isLoading || !isAuthenticated) return;
    let active = true;
    let running = false;
    async function sync() {
      if (running || !active) return;
      running = true;
      try {
        await syncNotificationRegistration(() => active);
      } catch (error) {
        // Retry on the next foreground event; never block app startup.
        console.warn("Unable to sync notification registration", error);
      } finally {
        running = false;
      }
    }
    void sync();
    const subscription = AppState.addEventListener("change", state => {
      if (state === "active") void sync();
    });
    return () => { active = false; subscription.remove(); };
  }, [isAuthenticated, isLoading]);
  return null;
}
