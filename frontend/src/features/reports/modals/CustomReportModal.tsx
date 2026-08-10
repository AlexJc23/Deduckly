import { useState, useRef, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
  Animated,
  Easing,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import DateTimePicker from "@react-native-community/datetimepicker";

type Props = {
  visible: boolean;
  onClose: () => void;
  onGenerate: (
    startDate: Date,
    endDate: Date,
  ) => void;
};

export function CustomReportModal({
  visible,
  onClose,
  onGenerate,
}: Props) {
  const [startDate, setStartDate] =
    useState(new Date());

  const [endDate, setEndDate] =
    useState(new Date());

  const [isMounted, setIsMounted] =
    useState(visible);

  const translateY = useRef(
    new Animated.Value(420),
  ).current;

  useEffect(() => {
    const animation = Animated.timing(
      translateY,
      {
        toValue: visible ? 0 : 420,
        duration: 300,
        easing: visible
          ? Easing.out(Easing.ease)
          : Easing.in(Easing.ease),
        useNativeDriver: true,
      },
    );

    if (visible) {
      setIsMounted(true);
      animation.start();
      return;
    }

    animation.start(() => {
      setIsMounted(false);
    });
  }, [visible, translateY]);

  if (!isMounted) {
    return null;
  }

  return (
    <Modal
      visible={isMounted}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onClose}
        />

        <Animated.View
          style={[
            styles.sheet,
            {
              transform: [{ translateY }],
            },
          ]}
        >
          <View style={styles.handle} />

          <View style={styles.header}>
            <View>
              <Text style={styles.eyebrow}>
                REPORTS
              </Text>

              <Text style={styles.title}>
                Custom Report
              </Text>

              <Text style={styles.subtitle}>
                Choose the period you want to
                analyze.
              </Text>
            </View>

            <View style={styles.headerIcon}>
              <Ionicons
                name="calendar-outline"
                size={19}
                color="#4A6FE3"
              />
            </View>
          </View>

          <View style={styles.input}>
            <View style={styles.inputHeader}>
              <View>
                <Text style={styles.label}>
                  Start Date
                </Text>

                <Text style={styles.helper}>
                  Beginning of report
                </Text>
              </View>

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
          </View>

          <View style={styles.input}>
            <View style={styles.inputHeader}>
              <View>
                <Text style={styles.label}>
                  End Date
                </Text>

                <Text style={styles.helper}>
                  End of report
                </Text>
              </View>

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
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.primaryButton,
              pressed &&
                styles.primaryButtonPressed,
            ]}
            onPress={() =>
              onGenerate(
                startDate,
                endDate,
              )
            }
          >
            <Ionicons
              name="document-text-outline"
              size={18}
              color="#FFFFFF"
            />

            <Text style={styles.primaryText}>
              Generate Report
            </Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.cancelButton,
              pressed &&
                styles.cancelButtonPressed,
            ]}
            onPress={onClose}
          >
            <Text style={styles.cancelText}>
              Cancel
            </Text>
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor:
      "rgba(15, 23, 42, 0.42)",
  },

  sheet: {
    backgroundColor: "#FCFDFE",
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 28,
    gap: 12,
    borderTopWidth: 1,
    borderColor: "#E8ECF2",
  },

  handle: {
    alignSelf: "center",
    width: 38,
    height: 4,
    borderRadius: 999,
    backgroundColor: "#CBD5E1",
    marginBottom: 8,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },

  eyebrow: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.2,
    color: "#94A3B8",
    marginBottom: 3,
  },

  title: {
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.4,
    color: "#273449",
  },

  subtitle: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 18,
    color: "#64748B",
  },

  headerIcon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: "#EEF2FF",
    alignItems: "center",
    justifyContent: "center",
  },

  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E7EBF1",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },

  inputHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  label: {
    fontSize: 13,
    fontWeight: "700",
    color: "#273449",
  },

  helper: {
    marginTop: 2,
    fontSize: 10,
    color: "#94A3B8",
  },

  primaryButton: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 4,
    backgroundColor: "#4A6FE3",
    borderRadius: 14,
  },

  primaryButtonPressed: {
    backgroundColor: "#3F61C9",
    transform: [{ scale: 0.985 }],
  },

  primaryText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },

  cancelButton: {
    minHeight: 38,
    alignItems: "center",
    justifyContent: "center",
  },

  cancelButtonPressed: {
    opacity: 0.55,
  },

  cancelText: {
    color: "#64748B",
    fontSize: 13,
    fontWeight: "700",
  },
});