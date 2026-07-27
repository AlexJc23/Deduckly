import { useEffect } from "react";
import { WeeklyGoal } from "@/features/users/types/user.types";
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

type WeeklyIncomeGoalCardProps = {
  weeklyGoal: WeeklyGoal;
};

const AnimatedText = Animated.createAnimatedComponent(Text);

export function WeeklyIncomeGoalCard({
  weeklyGoal,
}: WeeklyIncomeGoalCardProps) {
  const progress = useSharedValue(0);
  const percentage = useSharedValue(0);
  useEffect(() => {
    progress.value = withTiming(weeklyGoal.progress, {
      duration: 1200,
    });

    percentage.value = withTiming(weeklyGoal.percentage, {
      duration: 1200,
    });
  }, [weeklyGoal]);

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  const animatedProps = useAnimatedProps(() => {
    return {
      text: `${Math.round(percentage.value)}%`,
    } as any;
  });

  return (
    <View style={styles.container}>
        <View>
            <Text>Weekly Goal: </Text>
            <Text>${weeklyGoal.current}/${weeklyGoal.goal}</Text>
        </View>
      <View style={styles.progressBackground}>
        <Animated.View
          style={[
            styles.progressFill,
            progressStyle,
          ]}
        />
      </View>

      <AnimatedText
        animatedProps={animatedProps}
        style={styles.percentage}
      >
      </AnimatedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },

  progressBackground: {
    width: "100%",
    height: 30,
    backgroundColor: "#E5E7EB",
    borderRadius:  5,
    overflow: "hidden",
  },

  progressFill: {
    height: "100%",
    backgroundColor: "#2EAF4A",
    borderRadius:  5,
  },

  percentage: {
    fontSize: 16,
    fontWeight: "700",
    color: "#020202",
    textAlign: "center",
  },
});