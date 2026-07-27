import { ReportPeriod } from "../components/ReportPeriodSelector";
import { getCurrentMonthAndYear } from "./date";

export function buildReportParams(
  period: ReportPeriod
) {
  const { year, month, day } = getCurrentMonthAndYear();

  switch (period) {
    case "month":
      return {
        year,
        month,
      };

    case "last-month":
      return {
        year,
        month: month - 1,
      };

    case "year":
      return {
        year,
      };

    case "last-year":
      return {
        year: year - 1,
      };

    case "custom":
      return {};

    default:
      return {
        year,
        month,
      };
  }
}