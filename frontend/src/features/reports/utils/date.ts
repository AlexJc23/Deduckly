// src/utils/date.ts

export function getCurrentMonthAndYear() {
  const now = new Date();

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
): string {
  if (!month) {
    return `${year}`;
  }

  const date = new Date(year, month - 1, day ?? 1);

  if (day) {
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }

  return date.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}