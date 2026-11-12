import { reverseGeocode } from "./location.service";

export async function uploadAddress(lat: number, lng: number) {
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
