import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

export type ReportPeriod =
  | "month"
  | "last-month"
  | "year"
  | "last-year"
  | "custom";

type Props = {
  selected: ReportPeriod;
  onSelect: (period: ReportPeriod) => void;
};

const OPTIONS: {
  label: string;
  value: ReportPeriod;
}[] = [
  {
    label: "This Month",
    value: "month",
  },
  {
    label: "Last Month",
    value: "last-month",
  },
  {
    label: "This Year",
    value: "year",
  },
  {
    label: "Last Year",
    value: "last-year",
  },
  {
    label: "Custom",
    value: "custom",
  },
];

export function ReportPeriodSelector({
  selected,
  onSelect,
}: Props) {
  return (
    <View style={styles.container}>
      {OPTIONS.map((option) => {
        const isSelected =
          selected === option.value;

        return (
          <Pressable
            key={option.value}
            onPress={() =>
              onSelect(option.value)
            }
            style={({ pressed }) => [
              styles.option,
              isSelected &&
                styles.optionSelected,
              pressed &&
                styles.optionPressed,
            ]}
          >
            <Text
              style={[
                styles.text,
                isSelected &&
                  styles.textSelected,
              ]}
              numberOfLines={1}
            >
              {option.label}
            </Text>

            {isSelected && (
              <View
                style={styles.indicator}
              />
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EEF2F7",
    borderRadius: 12,
    padding: 3,
    borderWidth: 1,
    borderColor: "#E2E8F0",

    shadowColor: "#0F172A",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    elevation: 1,
  },

  option: {
    flex: 1,
    minHeight: 38,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
    borderRadius: 9,
    position: "relative",
  },

  optionSelected: {
    backgroundColor: "#FFFFFF",

    shadowColor: "#0F172A",
    shadowOpacity: 0.09,
    shadowRadius: 6,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    elevation: 2,
  },

  optionPressed: {
    transform: [{ scale: 0.97 }],
  },

  text: {
    fontSize: 10.5,
    fontWeight: "600",
    letterSpacing: -0.1,
    color: "#64748B",
  },

  textSelected: {
    color: "#172033",
    fontWeight: "800",
  },

  indicator: {
    position: "absolute",
    bottom: 3,
    width: 14,
    height: 2,
    borderRadius: 999,
    backgroundColor: "#4A6FE3",
  },
});