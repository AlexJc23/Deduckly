import { useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";

export type ActivityDateOption =
  | "current"
  | "last"
  | "year"
  | "custom";

type Props = {
  visible: boolean;
  isPremium: boolean;
  onClose: () => void;
  onUpgrade: () => void;
  onSelectPreset: (
    option: Exclude<ActivityDateOption, "custom">,
  ) => void;
  onApplyCustom: (
    startDate: Date,
    endDate: Date,
  ) => void;
};

export function ActivityDateModal({
  visible,
  isPremium,
  onClose,
  onUpgrade,
  onSelectPreset,
  onApplyCustom,
}: Props) {
  const [showCustom, setShowCustom] =
    useState(false);

  const [startDate, setStartDate] =
    useState(new Date());

  const [endDate, setEndDate] =
    useState(new Date());

  function selectPreset(
    option: Exclude<
      ActivityDateOption,
      "custom"
    >,
  ) {
    onSelectPreset(option);
    onClose();
  }

  function requirePremium(
    action: () => void,
  ) {
    if (!isPremium) {
      onClose();
      onUpgrade();
      return;
    }

    action();
  }

  function LockedLabel({
    title,
  }: {
    title: string;
  }) {
    return (
      <View style={styles.optionRow}>
        <Text style={styles.optionText}>
          {title}
        </Text>

        {!isPremium && (
          <Text style={styles.lock}>
            🔒
          </Text>
        )}
      </View>
    );
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onClose}
        />

        <Pressable
          style={styles.sheet}
          onPress={() => {}}
        >
          {!showCustom ? (
            <>
              <Text style={styles.title}>
                Activity Filter
              </Text>

              <Pressable
                style={styles.option}
                onPress={() =>
                  selectPreset(
                    "current",
                  )
                }
              >
                <Text style={styles.optionText}>
                  Current Month
                </Text>
              </Pressable>

              <Pressable
                style={styles.option}
                onPress={() =>
                  requirePremium(() =>
                    selectPreset(
                      "last",
                    ),
                  )
                }
              >
                <LockedLabel title="Last Month" />
              </Pressable>

              <Pressable
                style={styles.option}
                onPress={() =>
                  requirePremium(() =>
                    selectPreset(
                      "year",
                    ),
                  )
                }
              >
                <LockedLabel title="This Year" />
              </Pressable>

              <Pressable
                style={styles.option}
                onPress={() =>
                  requirePremium(() =>
                    setShowCustom(
                      true,
                    ),
                  )
                }
              >
                <LockedLabel title="Custom Range" />
              </Pressable>

              <Pressable
                style={styles.cancelButton}
                onPress={onClose}
              >
                <Text
                  style={
                    styles.cancelText
                  }
                >
                  Cancel
                </Text>
              </Pressable>
            </>
          ) : (
            <>
              <Text style={styles.title}>
                Custom Date Range
              </Text>

              <View style={styles.input}>
                <Text style={styles.label}>
                  Start Date
                </Text>

                <DateTimePicker
                  value={startDate}
                  mode="date"
                  display="compact"
                  maximumDate={
                    new Date()
                  }
                  onChange={(
                    _,
                    date,
                  ) => {
                    if (!date)
                      return;

                    setStartDate(
                      date,
                    );

                    if (
                      date >
                      endDate
                    ) {
                      setEndDate(
                        date,
                      );
                    }
                  }}
                />
              </View>

              <View style={styles.input}>
                <Text style={styles.label}>
                  End Date
                </Text>

                <DateTimePicker
                  value={endDate}
                  mode="date"
                  display="compact"
                  minimumDate={
                    startDate
                  }
                  maximumDate={
                    new Date()
                  }
                  onChange={(
                    _,
                    date,
                  ) => {
                    if (!date)
                      return;

                    setEndDate(
                      date,
                    );
                  }}
                />
              </View>

              <Pressable
                style={
                  styles.primaryButton
                }
                onPress={() => {
                  onApplyCustom(
                    startDate,
                    endDate,
                  );

                  setShowCustom(
                    false,
                  );

                  onClose();
                }}
              >
                <Text
                  style={
                    styles.primaryText
                  }
                >
                  Apply Filter
                </Text>
              </Pressable>

              <Pressable
                style={
                  styles.cancelButton
                }
                onPress={() =>
                  setShowCustom(
                    false,
                  )
                }
              >
                <Text
                  style={
                    styles.cancelText
                  }
                >
                  Back
                </Text>
              </Pressable>
            </>
          )}
        </Pressable>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor:
      "rgba(0,0,0,0.45)",
  },

  sheet: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    gap: 16,
  },

  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
  },

  option: {
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },

  optionRow: {
    flexDirection: "row",
    justifyContent:
      "space-between",
    alignItems: "center",
  },

  optionText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },

  lock: {
    fontSize: 16,
  },

  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },

  label: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 8,
  },

  primaryButton: {
    marginTop: 12,
    backgroundColor: "#2EAF4A",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },

  primaryText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
  },

  cancelButton: {
    alignItems: "center",
    paddingVertical: 14,
  },

  cancelText: {
    color: "#6B7280",
    fontSize: 16,
    fontWeight: "600",
  },
});