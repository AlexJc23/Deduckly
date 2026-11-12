import { uploadAddress } from '@/features/tracking/services/upload-address';
import { editShift, listShifts } from './journal';

export async function enrichShiftAddresses(owner: string, current: () => boolean) {
  for (const entry of await listShifts(owner)) {
    // A prepared upload must stay identical across response-loss retries.
    if (entry.pending || !entry.dirty) continue;
    for (const segment of entry.data.segments) {
      if (segment.converted_at || !segment.ended_at) continue;
      for (const side of ['start', 'end'] as const) {
        if (!current()) return;
        const lat = segment[`${side}_lat`], lng = segment[`${side}_lng`];
        if (segment[`${side}_address`] || lat == null || lng == null) continue;
        const value = await uploadAddress(lat, lng);
        if (!current()) return;
        if (value) await editShift(owner, entry.data.client_id, e => {
          const s = e.data.segments.find(s => s.client_id === segment.client_id);
          if (!e.pending && s && !s.converted_at && s[`${side}_lat`] === lat && s[`${side}_lng`] === lng && !s[`${side}_address`]) s[`${side}_address`] = value;
        });
      }
    }
  }
}
