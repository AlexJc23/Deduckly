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
import DateTimePicker from "@react-native-community/datetimepicker";

type Props = {
  visible: boolean;
  onClose: () => void;
  onGenerate: (startDate: Date, endDate: Date) => void;
};

export function CustomReportModal({
  visible,
  onClose,
  onGenerate,
}: Props) {
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());

  const [isMounted, setIsMounted] = useState(visible);

  const translateY = useRef(
    new Animated.Value(420)
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
      }
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

  return (
    <Modal
      visible={isMounted}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <Pressable
          style={StyleSheet.absoluteFillObject}
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
          <Text style={styles.title}>
            Custom Report
          </Text>

          <Text style={styles.subtitle}>
            Select a date range.
          </Text>

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
            style={styles.primaryButton}
            onPress={() =>
              onGenerate(
                startDate,
                endDate
              )
            }
          >
            <Text style={styles.primaryText}>
              Generate Report
            </Text>
          </Pressable>

          <Pressable
            style={styles.cancelButton}
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
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  sheet: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    gap: 18,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
  },
  subtitle: {
    fontSize: 15,
    color: "#6B7280",
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
    paddingVertical: 16,
    borderRadius: 14,
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