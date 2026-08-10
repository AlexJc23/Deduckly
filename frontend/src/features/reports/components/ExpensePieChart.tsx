import { CurrentReport } from "../types/report.types";
import { buildExpenseChartData } from "../utils/build-expense-chart";
import { PieChart } from "react-native-gifted-charts";
import {
  StyleSheet,
  View,
  Text,
  Pressable,
} from "react-native";
import { router } from "expo-router";

type ExpensePieChartProps = {
  expenseBreakdown: CurrentReport["expense_breakdown"];
};

export function ExpensePieChart({
  expenseBreakdown,
}: ExpensePieChartProps) {
  const pieData =
    buildExpenseChartData(expenseBreakdown);

  return (
    <View style={styles.wrapper}>
      <View style={styles.chartArea}>
        {pieData.length > 0 ? (
          <View style={styles.container}>
            <View style={styles.chartContainer}>
              <PieChart
                data={pieData}
                donut
                radius={58}
                innerRadius={0}
                centerLabelComponent={() => null}
              />
            </View>

            <View style={styles.legend}>
              {pieData.map((item) => (
                <View
                  key={item.category}
                  style={styles.legendRow}
                >
                  <View
                    style={[
                      styles.colorDot,
                      {
                        backgroundColor:
                          item.color,
                      },
                    ]}
                  />

                  <View style={styles.info}>
                    <View style={styles.left}>
                      <Text
                        style={styles.category}
                        numberOfLines={2}
                      >
                        {item.category}
                      </Text>

                      <Text style={styles.percent}>
                        {item.percent.toFixed(1)}%
                      </Text>
                    </View>

                    <Text style={styles.amount}>
                      {item.value.toLocaleString(
                        "en-US",
                        {
                          style: "currency",
                          currency: "USD",
                        },
                      )}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        ) : (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Text style={styles.emptyIconText}>
                $
              </Text>
            </View>

            <Text style={styles.emptyTitle}>
              No expenses yet
            </Text>

            <Text style={styles.emptyText}>
              Your expense breakdown will appear
              here once you start tracking expenses.
            </Text>
          </View>
        )}
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.allExpenseButton,
          pressed &&
            styles.allExpenseButtonPressed,
        ]}
        onPress={() =>
          router.push("/activity")
        }
      >
        <Text style={styles.allExpenseButtonText}>
          View All Expenses
        </Text>

        <Text style={styles.arrow}>
          ›
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
  },

  chartArea: {
    minHeight: 180,
    justifyContent: "center",
  },

  container: {
    minHeight: 180,
    flexDirection: "row",
    alignItems: "center",
  },

  chartContainer: {
    width: 135,
    height: 135,
    alignItems: "center",
    justifyContent: "center",
    transform: [{ rotate: "90deg" }],
  },

  legend: {
    flex: 1,
    marginLeft: 14,
  },

  legendRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
  },

  colorDot: {
    width: 11,
    height: 11,
    borderRadius: 6,
    marginTop: 4,
    marginRight: 10,
  },

  info: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  left: {
    flex: 1,
    paddingRight: 8,
  },

  category: {
    fontSize: 12,
    fontWeight: "600",
    color: "#111827",
  },

  percent: {
    fontSize: 11,
    color: "#9CA3AF",
    marginTop: 1,
  },

  amount: {
    width: 82,
    textAlign: "right",
    fontSize: 12,
    fontWeight: "700",
    color: "#4B5563",
  },

  emptyState: {
    minHeight: 180,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
  },

  emptyIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },

  emptyIconText: {
    fontSize: 18,
    fontWeight: "800",
    color: "#94A3B8",
  },

  emptyTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#334155",
  },

  emptyText: {
    marginTop: 4,
    fontSize: 11,
    lineHeight: 16,
    textAlign: "center",
    color: "#94A3B8",
  },

  allExpenseButton: {
    minHeight: 40,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    marginTop: 4,
  },

  allExpenseButtonPressed: {
    opacity: 0.6,
  },

  allExpenseButtonText: {
    color: "#4A6FE3",
    fontWeight: "700",
    fontSize: 12,
  },

  arrow: {
    color: "#4A6FE3",
    fontSize: 18,
    lineHeight: 18,
    marginTop: -1,
  },
});