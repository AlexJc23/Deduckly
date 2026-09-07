import { View, Text, Pressable } from "@/theme/components";
import { StyleSheet } from "react-native";
import { router } from "expo-router";
import { CurrentReport } from "../types/report.types";
import { buildExpenseChartData } from "../utils/build-expense-chart";
import { money } from "../utils/report-display";

export function ExpensePieChart({ expenseBreakdown }: { expenseBreakdown: CurrentReport["expense_breakdown"] }) {
  const items = buildExpenseChartData(expenseBreakdown ?? {});
  const hasAdjustments = items.some(item => item.value < 0);
  return <View style={s.card}>
    <Text style={s.description}>{hasAdjustments ? "Recorded spending by category, including negative adjustments. Percentages are hidden when categories include negative amounts." : "Categories ranked by recorded spending. Percentages show each category’s share of the total below, before tax adjustments."}</Text>
    {items.length ? <>
      <Text style={s.total}>Category total · {money(items.reduce((sum, item) => sum + item.value, 0))}</Text>
      {items.map((item, index) => <View key={`${item.category}-${index}`} style={s.item} accessible accessibilityLabel={`${item.category}, ${money(item.value)}${hasAdjustments ? "" : `, ${item.percent.toFixed(1)} percent of expenses`}`}>
        <View style={s.row}><Text style={s.category}>{item.category}</Text><Text selectable style={s.amount}>{money(item.value)}</Text></View>
        {!hasAdjustments && <><View style={s.track}><View style={[s.fill, { backgroundColor: item.color, width: `${Math.min(100, Math.max(0, item.percent))}%` }]} /></View>
        <Text style={s.percent}>{item.percent.toFixed(1)}% of category total</Text></>}
      </View>)}
      {items.some(item => item.category.startsWith("Other (")) && <Text style={s.description}>Other combines the remaining smaller categories.</Text>}
    </> : <View style={s.empty}><Text style={s.category}>No expenses in this period</Text><Text style={s.description}>Recorded expenses will appear here when they fall within the selected dates.</Text></View>}
    <Pressable accessibilityRole="button" onPress={() => router.push("/activity")} style={s.link}><Text style={s.linkText}>View activity</Text><Text style={s.description}>Browse your income, expenses, and trips</Text></Pressable>
  </View>;
}
const s = StyleSheet.create({
  card: { backgroundColor: "white", borderRadius: 18, borderWidth: 1, borderColor: "#E1E7EF", padding: 20 },
  description: { fontSize: 13, lineHeight: 20, color: "#64748B" }, total: { fontSize: 16, fontWeight: "600", color: "#273449", marginTop: 16 },
  item: { marginTop: 20, gap: 8 }, row: { flexDirection: "row", flexWrap: "wrap", gap: 8, justifyContent: "space-between" },
  category: { fontSize: 15, fontWeight: "600", color: "#273449", flexShrink: 1 }, amount: { fontSize: 15, color: "#273449", fontVariant: ["tabular-nums"] },
  track: { height: 7, borderRadius: 4, backgroundColor: "#EDF2F7", overflow: "hidden" }, fill: { height: "100%", borderRadius: 4 }, percent: { fontSize: 12, color: "#64748B" },
  empty: { paddingVertical: 24, gap: 8 }, link: { paddingTop: 20, marginTop: 16, gap: 5, borderTopColor: "#E1E7EF", borderTopWidth: StyleSheet.hairlineWidth, minHeight: 48 }, linkText: { color: "#0072B5", fontSize: 15, fontWeight: "600" },
});
