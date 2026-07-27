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
  const pieData = buildExpenseChartData(expenseBreakdown);

  return (
    <View>
      <View style={styles.container}>
        <View style={styles.chartContainer}>
          <PieChart
            data={pieData}
            donut
            semiCircle
            radius={100}
            innerRadius={50}
            showText={false}
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
                  { backgroundColor: item.color },
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
                    }
                  )}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      <Pressable
        style={styles.allExpenseButton}
        onPress={() => router.push("/activity")}
      >
        <Text style={styles.allExpenseButtonText}>
          View All Expenses
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    marginTop: 30,
    alignItems: "center",
  },

  chartContainer: {
    width: 135,
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

  allExpenseButton: {
    marginTop: 18,
    alignSelf: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },

  allExpenseButtonText: {
    color: "#323232",
    fontWeight: "700",
    fontSize: 11,
  },
});