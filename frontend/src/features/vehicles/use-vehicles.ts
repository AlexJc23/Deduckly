import { useEffect, useState, useSyncExternalStore, useCallback } from 'react';
import { AppState } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { useAuth } from '@/features/auth/context/auth.context';
import { getAccessToken } from '@/features/auth/services/auth-service.service';
import { trackingOwnerFromToken } from '@/features/tracking/services/tracking-owner';
import { subscribeAccountBoundary, getAccountGeneration } from '@/features/auth/services/account-boundary';
import { readVehicles, subscribeVehicles, syncVehicles } from './store';
import type { VehicleJournal } from './types';
export function useVehicles() {
  const { isAuthenticated } = useAuth();
  const generation = useSyncExternalStore(subscribeAccountBoundary, getAccountGeneration, getAccountGeneration);
  const [state, setState] = useState<{ generation: number; owner: string; data: VehicleJournal } | null>(null);
  const [problem, setProblem] = useState(false);
  useEffect(() => {
    let active = true, owner: string | null = null;
    setState(null); setProblem(false);
    const load = async () => {
      if (!active || !owner) return;
      try { const data = await readVehicles(owner); if (active) setState({ generation, owner, data }); }
      catch { if (active) setProblem(true); }
    };
    const sync = async () => {
      if (!active || !owner) return;
      try { await syncVehicles(owner); if (active) setProblem(false); }
      catch { if (active) setProblem(true); }
      await load();
    };
    if (isAuthenticated) void getAccessToken().then(async token => {
      if (!active) return; owner = trackingOwnerFromToken(token); await load(); await sync();
    }).catch(() => { if (active) setProblem(true); });
    const unsubscribe = subscribeVehicles(() => { void load(); });
    const app = AppState.addEventListener('change', value => { if (value === 'active') void sync(); });
    const net = NetInfo.addEventListener(value => { if (value.isConnected) void sync(); });
    return () => { active = false; unsubscribe(); app.remove(); net(); };
  }, [generation, isAuthenticated]);
  const valid = isAuthenticated && state?.generation === generation ? state : null;
  const sync = useCallback(async () => {
    if (!valid) return;
    try { await syncVehicles(valid.owner); setProblem(false); } catch { setProblem(true); }
  }, [valid]);
  return { owner: valid?.owner ?? null, data: valid?.data ?? null, problem, sync };
}
