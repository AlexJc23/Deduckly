import { api } from '@/api/client';
import { getAccessToken } from '@/features/auth/services/auth-service.service';
import { getAccountGeneration, isAccountChanging } from '@/features/auth/services/account-boundary';
import { trackingOwnerFromToken } from '@/features/tracking/services/tracking-owner';
import { acknowledgeShift, importShiftHistory, prepareShiftUpload, type Snapshot } from './journal';
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
  for (let i = 0; i < 100 && current(); i++) {
    const data = await prepareShiftUpload(owner);
    if (!data) break;
    const response = await api.put<Snapshot>(`/api/v1/shifts/${data.client_id}`, data, config);
    if (!current()) return;
    if (response.data.client_id !== data.client_id || response.data.revision !== data.revision) throw Error('Invalid Shift acknowledgement');
    await acknowledgeShift(owner, data.client_id, data.revision);
  }
  if (!current()) return;
  const response = await api.get<Snapshot[]>('/api/v1/shifts/?limit=100', config);
  if (current() && Array.isArray(response.data)) await importShiftHistory(owner, response.data);
}
