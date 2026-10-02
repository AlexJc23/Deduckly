import { reverseGeocode } from '@/features/tracking/services/location.service';
import { editShift, listShifts } from './journal';

async function address(lat: number, lng: number) {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    // Address enrichment must not hold up mileage synchronization indefinitely.
    const value = await Promise.race([
      reverseGeocode(lat, lng),
      new Promise<null>(resolve => { timer = setTimeout(() => resolve(null), 3000); }),
    ]);
    return value?.trim().slice(0, 100) || null;
  } catch { return null; }
  finally { if (timer) clearTimeout(timer); }
}

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
        const value = await address(lat, lng);
        if (!current()) return;
        if (value) await editShift(owner, entry.data.client_id, e => {
          const s = e.data.segments.find(s => s.client_id === segment.client_id);
          if (!e.pending && s && !s.converted_at && s[`${side}_lat`] === lat && s[`${side}_lng`] === lng && !s[`${side}_address`]) s[`${side}_address`] = value;
        });
      }
    }
  }
}
