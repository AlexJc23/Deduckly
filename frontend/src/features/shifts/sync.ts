import { queryClient } from '@/providers/query-client';
import { getActiveTrip, pendingTrips } from '@/features/tracking/services/trip-journal';
import { api } from '@/api/client';
import { getAccessToken } from '@/features/auth/services/auth-service.service';
import { getAccountGeneration, isAccountChanging } from '@/features/auth/services/account-boundary';
import { trackingOwnerFromToken } from '@/features/tracking/services/tracking-owner';
import { acknowledgeShift, importShiftHistory, prepareShiftUpload, listShifts, setBlockedConversions, type Snapshot } from './journal';
let syncing: Promise<void> | null = null;
export function syncShifts() {
  if (syncing) return syncing;
  syncing = run().finally(() => { syncing = null; });
  return syncing;
}
async function run() {
  const generation = getAccountGeneration();
  const owner = trackingOwnerFromToken(await getAccessToken());
  if (!owner || isAccountChanging()) return;
  const config = { deducklyOwnerId: owner, deducklyGeneration: generation };
  const current = () => !isAccountChanging() && generation === getAccountGeneration();
  const before = new Set((await listShifts(owner)).flatMap(e => e.data.segments.filter(s => s.converted_at).map(s => `${e.data.client_id}/${s.client_id}`)));
  for (let i = 0; i < 100 && current(); i++) {
    const data = await prepareShiftUpload(owner);
    if (!data) break;
    const response = await api.put<Snapshot>(`/api/v1/shifts/${data.client_id}`, data, config);
    if (!current()) return;
    if (response.data.client_id !== data.client_id || response.data.revision !== data.revision) throw Error('Invalid Shift acknowledgement');
    await acknowledgeShift(owner, data.client_id, data.revision);
    await importShiftHistory(owner, [response.data]);
  }
  if (!current()) return;
  // Flush every local classification/exclusion before evaluating midnight.
  // Wait for manual Trip uploads so overlapping mileage cannot be converted first.
  if (await prepareShiftUpload(owner)) return;
  if (!await getActiveTrip(owner) && !(await pendingTrips(owner)).length) {
    const conversion = await api.post<{ blocked_segments?: { shift_client_id: string; client_id: string }[] }>('/api/v1/shifts/convert-pending', {}, config);
    if (!current()) return;
    await setBlockedConversions(owner, conversion.data.blocked_segments ?? []);
  }
  const response = await api.get<Snapshot[]>('/api/v1/shifts/?limit=100', config);
  if (!current() || !Array.isArray(response.data)) return;
  await importShiftHistory(owner, response.data);
  // A locally retained old Shift can be outside the latest history page.
  for (const e of await listShifts(owner)) {
    if (!current()) return;
    if (!response.data.some(s => s.client_id === e.data.client_id) && e.data.segments.some(s => !s.converted_at)) {
      const detail = await api.get<Snapshot>(`/api/v1/shifts/${e.data.client_id}`, config);
      if (!current()) return;
      await importShiftHistory(owner, [detail.data]);
    }
  }
  const saved = (await listShifts(owner)).some(e => e.data.segments.some(s => s.converted_at && !before.has(`${e.data.client_id}/${s.client_id}`)));
  if (current() && saved) for (const queryKey of [['trips'], ['report'], ['today-report'], ['daily-goal']]) void queryClient.invalidateQueries({ queryKey });
}
