import { CurrentReport } from "../types/report.types";

const COLORS = [
  "#2EAF4A",
  "#239B45",
  "#65C878",
  "#9BDCA6",
];

const OTHER_COLOR = "#6B7280";

const MAX_CATEGORIES = 4;

export function buildExpenseChartData(
  expenseBreakdown: CurrentReport["expense_breakdown"]
) {
  const entries = Object.entries(expenseBreakdown).map(
    ([category, value]) => ({
      category: category
        .replace(/_/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase()),
      value: Number(value.amount),
      count: value.count,
    })
  );

  // Sort largest → smallest
  entries.sort((a, b) => b.value - a.value);

  // Top categories
  const chartData = entries.slice(0, MAX_CATEGORIES);

  // Combine the rest into "Other"
  const remaining = entries.slice(MAX_CATEGORIES);

  if (remaining.length > 0) {
    chartData.push({
      category: `Other (${remaining.length})`,
      value: remaining.reduce((sum, item) => sum + item.value, 0),
      count: remaining.reduce((sum, item) => sum + item.count, 0),
    });
  }

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  return chartData.map((item, index) => {
    const isOther = item.category.startsWith("Other");

    return {
      value: item.value,
      color: isOther
        ? OTHER_COLOR
        : COLORS[index % COLORS.length],
      text: "",
      category: item.category,
      count: item.count,
      percent:
        total === 0
          ? 0
          : Math.round((item.value / total) * 100),
    };
  });
}