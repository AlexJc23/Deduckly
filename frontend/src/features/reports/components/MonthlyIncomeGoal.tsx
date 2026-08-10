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
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    gap: 16,

    shadowColor: "#111827",
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 3,
    },

    elevation: 2,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  left: {
    flex: 1,
    paddingRight: 16,
  },

  eyebrow: {
    color: "#64748B",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.4,
  },

  current: {
    color: "#111827",
    fontSize: 28,
    fontWeight: "800",
    marginTop: 5,
    letterSpacing: -0.7,
  },

  goal: {
    color: "#64748B",
    fontSize: 13,
    fontWeight: "600",
    marginTop: 2,
  },

  orb: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#DCE6FF",
    borderWidth: 1,
    borderColor: "#4A6FE3",
    alignItems: "center",
    justifyContent: "center",
  },

  percentage: {
    color: "#4A6FE3",
    fontSize: 16,
    fontWeight: "800",
  },

  progressBackground: {
    width: "100%",
    height: 7,
    backgroundColor: "#E5E7EB",
    borderRadius: 999,
    overflow: "hidden",
  },

  progressFill: {
    height: "100%",
    backgroundColor: "#4A6FE3",
    borderRadius: 999,
  },

  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  status: {
    color: "#4A6FE3",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.8,
  },

  remaining: {
    color: "#64748B",
    fontSize: 12,
    fontWeight: "600",
  },
});