import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLanguage, translate } from '@/i18n/core';
import { claimEndedNotice, type Entry } from './journal';
let queue: Promise<unknown> = Promise.resolve();
let lastSignature = ""; let lastCheck = 0;
export async function requestShiftNotifications() {
  if (Platform.OS === 'web') return;
  const permission = await Notifications.getPermissionsAsync();
  if (permission.status === 'undetermined' && permission.canAskAgain) await Notifications.requestPermissionsAsync();
}
export function reconcileShiftNotifications(owner: string | null, entries: Entry[]) {
  const next = queue.then(async () => {
    if (Platform.OS === 'web') return;
    const storedLanguage = await AsyncStorage.getItem('deduckly.language');
    const language = storedLanguage === 'en' || storedLanguage === 'es' ? storedLanguage : getLanguage();
    const locale = language === 'es' ? 'es-US' : 'en-US';
    const t = (text: string, params?: Record<string, string | number>) => translate(text, params, language);
    const signature = JSON.stringify([owner, locale, entries.map(e => [e.owner, e.local, e.data.client_id, e.data.ended_at, e.data.planned_end_at, e.autoEnded, e.endedNoticeClaimed])]);
    if (signature === lastSignature && Date.now()-lastCheck < 30_000) return;
    const permitted = (await Notifications.getPermissionsAsync()).granted;
    const desired = entries.filter(e => e.owner === owner && e.local && !e.data.ended_at && e.data.planned_end_at);
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    const keep = new Set<string>();
    for (const e of desired) {
      const at = Date.parse(e.data.planned_end_at!) - 10 * 60_000;
      const identifier = `shift-warning:${owner}:${e.data.client_id}`;
      const body = t("Your shift is scheduled to end at {time}. Add more time if you're continuing to work.", { time: new Date(e.data.planned_end_at!).toLocaleTimeString(locale, { hour: 'numeric', minute: '2-digit' }) });
      const old = scheduled.find(n => n.identifier === identifier);
      if (!permitted || at <= Date.now()) continue;
      keep.add(identifier);
      if (old?.content.data?.at === at && old.content.body === body) continue;
      if (old) await Notifications.cancelScheduledNotificationAsync(identifier);
      if (Platform.OS === 'android') await Notifications.setNotificationChannelAsync('shifts', { name: t('Shift reminders'), importance: Notifications.AndroidImportance.DEFAULT });
      await Notifications.scheduleNotificationAsync({ identifier, content: { title: t('Shift ending soon'), body, data: { kind: 'shift', owner, shiftId: e.data.client_id, at } }, trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: new Date(at), ...(Platform.OS === 'android' ? { channelId: 'shifts' } : {}) } });
    }
    for (const old of scheduled) if (old.identifier.startsWith('shift-warning:') && !keep.has(old.identifier)) await Notifications.cancelScheduledNotificationAsync(old.identifier);
    for (const e of entries) {
      if (e.owner !== owner || !e.autoEnded || e.endedNoticeClaimed || !permitted) continue;
      // Claim before OS delivery to avoid duplicate notices after recovery.
      if (await claimEndedNotice(e.owner, e.data.client_id)) await Notifications.scheduleNotificationAsync({ identifier: `shift-ended:${owner}:${e.data.client_id}`, content: { title: t('Shift ended'), body: t('Your shift has ended. Review your detected drives and save your trips.'), data: { kind: 'shift', owner, shiftId: e.data.client_id } }, trigger: null });
    }
    lastSignature = signature; lastCheck = Date.now();
  });
  queue = next.catch(() => {}); return next;
}
