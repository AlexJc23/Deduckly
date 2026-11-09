import { getLocale } from "@/i18n/core";
// src/utils/date.ts

export function getCurrentMonthAndYear(timezone?: string, now = new Date()) {
  if (timezone) {
    let formatter: Intl.DateTimeFormat;
    try { formatter = new Intl.DateTimeFormat('en-US', { timeZone: timezone, year: 'numeric', month: 'numeric', day: 'numeric' }); }
    catch { formatter = new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', year: 'numeric', month: 'numeric', day: 'numeric' }); }
    const parts = formatter.formatToParts(now);
    const value = (name: string) => Number(parts.find(part => part.type === name)?.value);
    return { year: value('year'), month: value('month'), day: value('day') };
  }

  return {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    day: now.getDate(),
  };
}


export function formatReportDate(
  year: number,
  month?: number | null,
  day?: number | null,
  locale = getLocale(),
): string {
  if (!month) {
    return `${year}`;
  }

  const date = new Date(year, month - 1, day ?? 1);

  if (day) {
    return date.toLocaleDateString(locale, {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }

  return date.toLocaleDateString(locale, {
    month: "long",
    year: "numeric",
  });
}