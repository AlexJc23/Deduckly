import { Pressable, Text, View } from "react-native";

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
    label: "Monthly",
    value: "month",
  },
  {
    label: "Last Month",
    value: "last-month",
  },
  {
    label: "Yearly",
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
    <View>
      {OPTIONS.map((option) => (
        <Pressable
          key={option.value}
          onPress={() => onSelect(option.value)}
        >
          <Text>{option.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}