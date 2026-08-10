import { useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  Animated,
  Easing,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import Ionicons from "@expo/vector-icons/Ionicons";

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

  const backdropOpacity = useState(
    new Animated.Value(0),
  )[0];

  const sheetTranslateY = useState(
    new Animated.Value(400),
  )[0];

  function selectPreset(
    option: Exclude<
      ActivityDateOption,
      "custom"
    >,
  ) {
    onSelectPreset(option);
    closeModal();
  }

  function requirePremium(
    action: () => void,
  ) {
    if (!isPremium) {
      closeModal();
      onUpgrade();
      return;
    }

    action();
  }

  function openModal() {
    Animated.parallel([
      Animated.timing(backdropOpacity, {
        toValue: 1,
        duration: 220,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),

      Animated.timing(sheetTranslateY, {
        toValue: 0,
        duration: 300,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }

  function closeModal() {
    Animated.parallel([
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 180,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }),

      Animated.timing(sheetTranslateY, {
        toValue: 400,
        duration: 240,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowCustom(false);
      onClose();
    });
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
          <Ionicons
            name="lock-closed-outline"
            size={15}
            color="#94A3B8"
          />
        )}
      </View>
    );
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onShow={openModal}
      onRequestClose={closeModal}
    >
      <View style={styles.backdrop}>
        <Animated.View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFill,
            {
              opacity: backdropOpacity,
              backgroundColor:
                "rgba(15, 23, 42, 0.45)",
            },
          ]}
        />

        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={closeModal}
        />

        <Animated.View
          style={[
            styles.sheet,
            {
              transform: [
                {
                  translateY: sheetTranslateY,
                },
              ],
            },
          ]}
        >
          {!showCustom ? (
            <>
              <View style={styles.header}>
                <View>
                  <Text style={styles.title}>
                    Activity Filter
                  </Text>
                </View>

                <Pressable
                  style={styles.closeButton}
                  onPress={closeModal}
                  hitSlop={8}
                >
                  <Ionicons
                    name="close"
                    size={20}
                    color="#64748B"
                  />
                </Pressable>
              </View>

              <Pressable
                style={({ pressed }) => [
                  styles.option,
                  pressed && styles.optionPressed,
                ]}
                onPress={() =>
                  selectPreset("current")
                }
              >
                <View style={styles.optionIcon}>
                  <Ionicons
                    name="calendar-outline"
                    size={18}
                    color="#4A6FE3"
                  />
                </View>

                <Text style={styles.optionText}>
                  Current Month
                </Text>

                <Ionicons
                  name="chevron-forward"
                  size={17}
                  color="#94A3B8"
                />
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  styles.option,
                  pressed && styles.optionPressed,
                ]}
                onPress={() =>
                  requirePremium(() =>
                    selectPreset("last"),
                  )
                }
              >
                <View style={styles.optionIcon}>
                  <Ionicons
                    name="arrow-back-outline"
                    size={18}
                    color="#64748B"
                  />
                </View>

                <LockedLabel title="Last Month" />

                {isPremium && (
                  <Ionicons
                    name="chevron-forward"
                    size={17}
                    color="#94A3B8"
                  />
                )}
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  styles.option,
                  pressed && styles.optionPressed,
                ]}
                onPress={() =>
                  requirePremium(() =>
                    selectPreset("year"),
                  )
                }
              >
                <View style={styles.optionIcon}>
                  <Ionicons
                    name="calendar-number-outline"
                    size={18}
                    color="#64748B"
                  />
                </View>

                <LockedLabel title="This Year" />

                {isPremium && (
                  <Ionicons
                    name="chevron-forward"
                    size={17}
                    color="#94A3B8"
                  />
                )}
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  styles.option,
                  pressed && styles.optionPressed,
                ]}
                onPress={() =>
                  requirePremium(() =>
                    setShowCustom(true),
                  )
                }
              >
                <View style={styles.optionIcon}>
                  <Ionicons
                    name="options-outline"
                    size={18}
                    color="#64748B"
                  />
                </View>

                <LockedLabel title="Custom Range" />

                {isPremium && (
                  <Ionicons
                    name="chevron-forward"
                    size={17}
                    color="#94A3B8"
                  />
                )}
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  styles.cancelButton,
                  pressed &&
                    styles.cancelButtonPressed,
                ]}
                onPress={closeModal}
              >
                <Text style={styles.cancelText}>
                  Cancel
                </Text>
              </Pressable>
            </>
          ) : (
            <>
              <View style={styles.header}>
                <View>

                  <Text style={styles.title}>
                    Custom Date Range
                  </Text>
                </View>

                <Pressable
                  style={styles.closeButton}
                  onPress={closeModal}
                  hitSlop={8}
                >
                  <Ionicons
                    name="close"
                    size={20}
                    color="#64748B"
                  />
                </Pressable>
              </View>

              <View style={styles.input}>
                <Text style={styles.label}>
                  Start Date
                </Text>

                <DateTimePicker
                  value={startDate}
                  mode="date"
                  display="compact"
                  maximumDate={new Date()}
                  onChange={(_, date) => {
                    if (!date) return;

                    setStartDate(date);

                    if (date > endDate) {
                      setEndDate(date);
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
                  minimumDate={startDate}
                  maximumDate={new Date()}
                  onChange={(_, date) => {
                    if (!date) return;

                    setEndDate(date);
                  }}
                />
              </View>

              <Pressable
                style={({ pressed }) => [
                  styles.primaryButton,
                  pressed &&
                    styles.primaryButtonPressed,
                ]}
                onPress={() => {
                  onApplyCustom(
                    startDate,
                    endDate,
                  );

                  closeModal();
                }}
              >
                <Text style={styles.primaryText}>
                  Apply Filter
                </Text>
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  styles.cancelButton,
                  pressed &&
                    styles.cancelButtonPressed,
                ]}
                onPress={() =>
                  setShowCustom(false)
                }
              >
                <Ionicons
                  name="chevron-back"
                  size={16}
                  color="#64748B"
                />

                <Text style={styles.cancelText}>
                  Back
                </Text>
              </Pressable>
            </>
          )}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: "flex-end",
  },

  sheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    gap: 10,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },

  eyebrow: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.2,
    color: "#64748B",
    marginBottom: 4,
  },

  title: {
    fontSize: 23,
    fontWeight: "800",
    color: "#111827",
  },

  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
  },

  option: {
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 12,
  },

  optionPressed: {
    backgroundColor: "#F8FAFC",
    transform: [{ scale: 0.99 }],
  },

  optionIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },

  optionRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  optionText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },

  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#F8FAFC",
  },

  label: {
    fontSize: 12,
    fontWeight: "700",
    color: "#64748B",
    marginBottom: 6,
  },

  primaryButton: {
    marginTop: 8,
    backgroundColor: "#4A6FE3",
    borderRadius: 14,
    minHeight: 50,
    alignItems: "center",
    justifyContent: "center",
  },

  primaryButtonPressed: {
    backgroundColor: "#3559C7",
    transform: [{ scale: 0.985 }],
  },

  primaryText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },

  cancelButton: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
  },

  cancelButtonPressed: {
    opacity: 0.6,
  },

  cancelText: {
    color: "#64748B",
    fontSize: 14,
    fontWeight: "600",
  },
});