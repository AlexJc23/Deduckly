import * as Notifications from 'expo-notifications';
import { router, type Href } from 'expo-router';
import { checkShiftDeadline } from '@/features/tracking/services/background-tracking';
import { reconcileShiftNotifications } from './notifications';
import { subscribeLanguage } from '@/i18n/core';
import { useCallback, createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { AppState } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { useAuth } from '@/features/auth/context/auth.context';
import { getAccessToken } from '@/features/auth/services/auth-service.service';
import { getAccountGeneration, isAccountChanging, subscribeAccountBoundary } from '@/features/auth/services/account-boundary';
import { trackingOwnerFromToken } from '@/features/tracking/services/tracking-owner';
import { listShifts, subscribeShifts, type Entry } from './journal';
import { syncShifts } from './sync';
import { syncRecordedTrips } from '@/features/tracking/services/trip-journal-sync';
import { describeSyncIssue, type SyncIssue } from '@/features/tracking/services/sync-issue';
const Context = createContext<{ owner: string | null; entries: Entry[]; syncError: SyncIssue | null; sync: (retryTrips?: boolean) => Promise<void> }>({ owner: null, entries: [], syncError: null, sync: async () => {} });
export function ShiftProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const [owner, setOwner] = useState<string | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [syncError, setSyncError] = useState<SyncIssue | null>(null);
  const sync = useCallback(async (retryTrips = false) => {
    const generation = getAccountGeneration();
    // Manual retry also flushes Trips, even if the Shift queue is blocked.
    if (retryTrips) await syncRecordedTrips();
    if (generation !== getAccountGeneration() || isAccountChanging()) return;
    try {
      const currentOwner = trackingOwnerFromToken(await getAccessToken());
      if (currentOwner) await checkShiftDeadline(currentOwner);
      await syncShifts();
      if (generation === getAccountGeneration()) setSyncError(null);
    } catch (error) {
      if (generation === getAccountGeneration()) setSyncError(describeSyncIssue(error, 'shift'));
    }
  }, []);
  useEffect(() => {
    let alive = true;
    let ownerId: string | null = null;
    const generation = getAccountGeneration();
    async function refresh() {
      const nextOwner = !isLoading && isAuthenticated && !isAccountChanging() ? trackingOwnerFromToken(await getAccessToken()) : null;
      const saved = nextOwner ? await listShifts(nextOwner) : [];
      if (alive && generation === getAccountGeneration() && !isAccountChanging()) { ownerId = nextOwner; setOwner(nextOwner); setEntries(saved); void reconcileShiftNotifications(nextOwner, saved).catch(() => {}); }
    }
    const onSyncError = (error: unknown) => {
      if (alive && generation === getAccountGeneration()) setSyncError(describeSyncIssue(error, 'shift'));
    };
    const boundary = subscribeAccountBoundary(() => { ownerId = null; setOwner(null); setEntries([]); setSyncError(null); void reconcileShiftNotifications(null, []).catch(() => {}); });
    void refresh().catch(onSyncError);
    if (isAuthenticated && !isLoading) void refresh().then(() => ownerId ? checkShiftDeadline(ownerId) : undefined).then(() => sync()).catch(onSyncError);
    const unsubscribe = subscribeShifts(() => { if (ownerId) void refresh().catch(onSyncError); });
    const state = AppState.addEventListener('change', value => { if (value === 'active') { void refresh().then(() => ownerId ? checkShiftDeadline(ownerId) : undefined).then(() => sync()).catch(onSyncError); } });
    const network = NetInfo.addEventListener(value => { if (value.isConnected) void sync(); });
    const timer = setInterval(() => { if (ownerId) void checkShiftDeadline(ownerId).then(() => sync()).catch(onSyncError); }, 30_000);
    const language = subscribeLanguage(() => { void refresh().catch(onSyncError); });
    const open = (response: Notifications.NotificationResponse | null) => {
      const data = response?.notification.request.content.data;
      if (data?.kind === 'shift' && ownerId && data.owner === ownerId && typeof data.shiftId === 'string' && generation === getAccountGeneration()) {
        router.push({ pathname: '/shifts', params: { id: data.shiftId } } as Href);
        void Notifications.clearLastNotificationResponseAsync();
      }
    };
    const response = Notifications.addNotificationResponseReceivedListener(open);
    void refresh().then(() => Notifications.getLastNotificationResponseAsync()).then(open).catch(() => {});
    return () => { response.remove(); language(); alive = false; boundary(); unsubscribe(); state.remove(); network(); clearInterval(timer); };
  }, [isAuthenticated, isLoading, sync]);
  return <Context.Provider value={{ owner: isAuthenticated && !isAccountChanging() ? owner : null, entries: isAuthenticated && !isAccountChanging() ? entries : [], syncError, sync }}>{children}</Context.Provider>;
}
export const useShifts = () => useContext(Context);
