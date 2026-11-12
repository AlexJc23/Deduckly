import { getLocale } from "@/i18n/core";
import { UseCurrentReportParams } from "../hooks/use-current-report";
import { formatReportDate } from "./date";

export function reportNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}
export function money(value: unknown): string {
  const number = reportNumber(value);
  return number === null ? "—" : number.toLocaleString("en-US", { style: "currency", currency: "USD" });
}
export function miles(value: unknown): string {
  const number = reportNumber(value);
  return number === null ? "—" : `${number.toLocaleString("en-US", { maximumFractionDigits: 2 })} mi`;
}
export function reportPeriodLabel(params: UseCurrentReportParams, locale = getLocale()): string {
  if (params.startDate && params.endDate) {
    const format = (d: Date) => d.toLocaleDateString(locale, { month: "short", day: "numeric", year: "numeric" });
    return `${format(params.startDate)} – ${format(params.endDate)}`;
  }
  return params.year ? formatReportDate(params.year, params.month, params.day, locale) : "Selected period";
}
export function localDateString(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}


// Color describes the direction of the amount, not a change versus another period.
export function reportImpactColor(value: unknown, isCost = false) {
  const number = reportNumber(value);
  if (number === null || number === 0) return "#64748B";
  const positive = isCost ? number < 0 : number > 0;
  return positive ? "#15803D" : "#B91C1C";
}
