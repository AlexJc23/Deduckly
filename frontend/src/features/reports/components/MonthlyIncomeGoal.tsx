import { useEffect } from "react";
import { MonthlyGoal } from "@/features/users/types/user.types";
import {
  View,
  StyleSheet,
  Text,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedProps,
  withTiming,
} from "react-native-reanimated";

type MonthlyIncomeGoalCardProps = {
  monthlyGoal: MonthlyGoal;
};

const AnimatedText =
  Animated.createAnimatedComponent(Text);

export function MonthlyIncomeGoalCard({
  monthlyGoal,
}: MonthlyIncomeGoalCardProps) {
  const progress = useSharedValue(0);
  const percentage = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(
      monthlyGoal.progress,
      {
        duration: 1200,
      }
    );

    percentage.value = withTiming(
      monthlyGoal.percentage,
      {
        duration: 1200,
      }
    );
  }, [monthlyGoal]);

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  const animatedProps = useAnimatedProps(
    () =>
      ({
        text: `${Math.round(
          percentage.value
        )}%`,
      }) as any
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.left}>
          <Text style={styles.eyebrow}>
            MONTHLY INCOME TARGET
          </Text>

          <Text style={styles.current}>
            $
            {monthlyGoal.current.toLocaleString(
              "en-US",
              {
                minimumFractionDigits: 2,
              }
            )}
          </Text>

          <Text style={styles.goal}>
            Goal $
            {monthlyGoal.goal.toLocaleString(
              "en-US",
              {
                minimumFractionDigits: 2,
              }
            )}
          </Text>
        </View>

        <View style={styles.orb}>
          <AnimatedText
            animatedProps={animatedProps}
            style={styles.percentage}
          >
            {`${Math.round(
              monthlyGoal.percentage
            )}%`}
          </AnimatedText>
        </View>
      </View>

      <View style={styles.progressBackground}>
        <Animated.View
          style={[
            styles.progressFill,
            progressStyle,
          ]}
        />
      </View>

      <View style={styles.footer}>
        <Text style={styles.status}>
          {monthlyGoal.percentage >= 100
            ? "GOAL REACHED"
            : monthlyGoal.percentage >= 80
            ? "ON TRACK"
            : "IN PROGRESS"}
        </Text>

        <Text style={styles.remaining}>
          $
          {Math.max(
            monthlyGoal.goal -
              monthlyGoal.current,
            0
          ).toLocaleString("en-US", {
            minimumFractionDigits: 2,
          })}{" "}
          left
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: "#EEF2F6",
    gap: 16,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  left: {
    flex: 1,
    paddingRight: 12,
  },

  eyebrow: {
    color: "#8B95A7",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.6,
  },

  current: {
    color: "#111827",
    fontSize: 28,
    fontWeight: "900",
    marginTop: 4,
    letterSpacing: -0.8,
  },

  goal: {
    color: "#6B7280",
    fontSize: 13,
    fontWeight: "600",
    marginTop: 2,
  },

  orb: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#F2FBF5",
    borderWidth: 2,
    borderColor: "#2EAF4A",
    alignItems: "center",
    justifyContent: "center",
  },

  percentage: {
    color: "#2EAF4A",
    fontSize: 17,
    fontWeight: "900",
  },

  progressBackground: {
    width: "100%",
    height: 8,
    backgroundColor: "#E5E7EB",
    borderRadius: 999,
    overflow: "hidden",
  },

  progressFill: {
    height: "100%",
    backgroundColor: "#2EAF4A",
    borderRadius: 999,
  },

  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  status: {
    color: "#2EAF4A",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.8,
  },

  remaining: {
    color: "#6B7280",
    fontSize: 12,
    fontWeight: "600",
  },
});