import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { AppState } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { useAuth } from '@/features/auth/context/auth.context';
import { getAccessToken } from '@/features/auth/services/auth-service.service';
import { getAccountGeneration, isAccountChanging, subscribeAccountBoundary } from '@/features/auth/services/account-boundary';
import { trackingOwnerFromToken } from '@/features/tracking/services/tracking-owner';
import { listShifts, subscribeShifts, type Entry } from './journal';
import { syncShifts } from './sync';
const Context = createContext<{ owner: string | null; entries: Entry[]; syncError: boolean; sync: () => Promise<void> }>({ owner: null, entries: [], syncError: false, sync: async () => {} });
export function ShiftProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const [owner, setOwner] = useState<string | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [syncError, setSyncError] = useState(false);
  async function sync() {
    const generation = getAccountGeneration();
    try { await syncShifts(); if (generation === getAccountGeneration()) setSyncError(false); }
    catch { if (generation === getAccountGeneration()) setSyncError(true); }
  }
  useEffect(() => {
    let alive = true;
    let ownerId: string | null = null;
    const generation = getAccountGeneration();
    async function refresh() {
      const nextOwner = !isLoading && isAuthenticated && !isAccountChanging() ? trackingOwnerFromToken(await getAccessToken()) : null;
      const saved = nextOwner ? await listShifts(nextOwner) : [];
      if (alive && generation === getAccountGeneration() && !isAccountChanging()) { ownerId = nextOwner; setOwner(nextOwner); setEntries(saved); }
    }
    const boundary = subscribeAccountBoundary(() => { ownerId = null; setOwner(null); setEntries([]); setSyncError(false); });
    void refresh().catch(() => { if (alive) setSyncError(true); });
    if (isAuthenticated && !isLoading) void sync();
    const unsubscribe = subscribeShifts(() => { if (ownerId) void refresh().catch(() => { if (alive) setSyncError(true); }); });
    const state = AppState.addEventListener('change', value => { if (value === 'active') { void refresh().catch(() => setSyncError(true)); void sync(); } });
    const network = NetInfo.addEventListener(value => { if (value.isConnected) void sync(); });
    const timer = setInterval(() => { if (ownerId) void sync(); }, 30_000);
    return () => { alive = false; boundary(); unsubscribe(); state.remove(); network(); clearInterval(timer); };
  }, [isAuthenticated, isLoading]);
  return <Context.Provider value={{ owner: isAuthenticated && !isAccountChanging() ? owner : null, entries: isAuthenticated && !isAccountChanging() ? entries : [], syncError, sync }}>{children}</Context.Provider>;
}
export const useShifts = () => useContext(Context);
