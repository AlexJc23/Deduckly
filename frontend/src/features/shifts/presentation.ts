import type { Entry } from './journal';
import { PLATFORM_LABELS } from '@/constants/platform-labels';
export const SHIFT_PLATFORMS = ['spark','doordash','uber_eats','uber','lyft','grubhub','instacart','amazon_flex','shipt','other'];
export function platformName(value: string | null | undefined) { return value ? PLATFORM_LABELS[value as keyof typeof PLATFORM_LABELS] ?? value : 'No platform'; }
export function elapsedMinutes(start: string, end: string | null, now: number) {
 const minutes = Math.floor(((end ? Date.parse(end) : now)-Date.parse(start))/60000);
 return Number.isFinite(minutes) ? Math.max(0,minutes) : 0;
}
export function shiftMiles(entry: Entry) {
 const completed = entry.data.segments.filter(s => !s.excluded).reduce((n,s) => n+(Number.isFinite(Number(s.distance_miles)) ? Number(s.distance_miles) : 0),0);
 const live = entry.detector.driving && Number.isFinite(entry.detector.miles) ? entry.detector.miles : 0;
 return completed + live;
}
