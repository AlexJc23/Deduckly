import { useEffect } from "react";
import { AppState } from "react-native";
import { useAuth } from "@/features/auth/context/auth.context";
import { flushPendingLogouts } from '@/features/auth/services/pending-logout';
import { retryDeletedAccountCleanup } from '@/features/auth/services/deleted-account';
import NetInfo from '@react-native-community/netinfo';
import { syncNotificationRegistration } from "@/services/notifications";

export function NotificationSync() {
  const { isAuthenticated, isLoading } = useAuth();
  useEffect(() => {
    if (isLoading) return;
    let active = true;
    let running = false;
    async function sync() {
      if (running || !active) return;
      running = true;
      try {
        await Promise.allSettled([flushPendingLogouts(), retryDeletedAccountCleanup()]);
        if (isAuthenticated && active) await syncNotificationRegistration(() => active);
      } catch {
        // Retry on the next foreground event; never block app startup.
        console.warn("Unable to sync notification registration; will retry on foreground.");
      } finally {
        running = false;
      }
    }
    void sync();
    const subscription = AppState.addEventListener("change", state => {
      if (state === "active") void sync();
    });
    const unsubscribeNetwork = NetInfo.addEventListener(state => { if (state.isConnected) void sync(); });
    return () => { active = false; subscription.remove(); unsubscribeNetwork(); };
  }, [isAuthenticated, isLoading]);
  return null;
}
