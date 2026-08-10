import {
  Modal,
  View,
  Text,
  TextInput,
  Pressable,
  Animated,
  Easing,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  InputAccessoryView,
} from "react-native";
import { useEffect, useRef, useState } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";

type IncomeModalProps = {
  visible: boolean;
  onSave: (income: number | null) => void;
  onSkip: () => void;
};

export function IncomeModal({
  visible,
  onSave,
  onSkip,
}: IncomeModalProps) {
  const [income, setIncome] = useState("");

  const translateY = useRef(
    new Animated.Value(420)
  ).current;

  useEffect(() => {
    if (visible) {
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(translateY, {
        toValue: 420,
        duration: 300,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }).start(() => {
        setIncome("");
      });
    }
  }, [visible, translateY]);

  const inputAccessoryViewID =
    "incomeKeyboard";

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onSkip}
    >
      <KeyboardAvoidingView
        behavior={
          Platform.OS === "ios"
            ? "padding"
            : undefined
        }
        style={styles.container}
      >
        <Pressable
          style={styles.backdrop}
          onPress={onSkip}
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
            <View style={styles.iconContainer}>
              <Ionicons
                name="checkmark-circle-outline"
                size={24}
                color="#4A6FE3"
              />
            </View>

            <View style={styles.headerText}>
              <Text style={styles.title}>
                Trip Complete
              </Text>

              <Text style={styles.subtitle}>
                Add your earnings to finish recording
                this trip.
              </Text>
            </View>
          </View>

          <View style={styles.inputSection}>
            <Text style={styles.label}>
              Income
            </Text>

            <Text style={styles.optional}>
              Optional
            </Text>

            <TextInput
              value={income}
              onChangeText={setIncome}
              keyboardType="decimal-pad"
              placeholder="$0.00"
              placeholderTextColor="#94A3B8"
              inputAccessoryViewID={
                inputAccessoryViewID
              }
              style={styles.input}
            />
          </View>

          <InputAccessoryView
            nativeID={inputAccessoryViewID}
          >
            <View
              style={styles.accessoryContainer}
            >
              <Pressable
                onPress={Keyboard.dismiss}
              >
                <Text style={styles.doneText}>
                  Done
                </Text>
              </Pressable>
            </View>
          </InputAccessoryView>

          <Pressable
            onPress={() => {
              Keyboard.dismiss();

              const amount =
                income.trim() === ""
                  ? null
                  : Number(income);

              onSave(amount);
            }}
            style={({ pressed }) => [
              styles.saveButton,
              pressed &&
                styles.saveButtonPressed,
            ]}
          >
            <Ionicons
              name="checkmark"
              size={18}
              color="#FFFFFF"
            />

            <Text style={styles.saveText}>
              Save Trip
            </Text>
          </Pressable>

          <Pressable
            onPress={() => {
              Keyboard.dismiss();
              onSkip();
            }}
            style={({ pressed }) => [
              styles.skipButton,
              pressed &&
                styles.skipButtonPressed,
            ]}
          >
            <Text style={styles.skipText}>
              Skip
            </Text>
          </Pressable>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-end",
  },

  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor:
      "rgba(15, 23, 42, 0.62)",
  },

  sheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 28,
    minHeight: 350,

    shadowColor: "#000000",
    shadowOpacity: 0.2,
    shadowRadius: 24,
    shadowOffset: {
      width: 0,
      height: -8,
    },

    elevation: 12,
  },

  handle: {
    alignSelf: "center",
    width: 38,
    height: 4,
    borderRadius: 999,
    backgroundColor: "#CBD5E1",
    marginBottom: 22,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },

  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#DCE6FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 13,
  },

  headerText: {
    flex: 1,
  },

  title: {
    fontSize: 23,
    fontWeight: "800",
    color: "#111827",
    letterSpacing: -0.5,
  },

  subtitle: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 18,
    color: "#64748B",
  },

  inputSection: {
    marginBottom: 20,
  },

  label: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
  },

  optional: {
    position: "absolute",
    right: 0,
    top: 0,
    fontSize: 12,
    fontWeight: "600",
    color: "#94A3B8",
  },

  input: {
    height: 52,
    backgroundColor: "#F8FAFC",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 16,
    fontSize: 17,
    fontWeight: "600",
    color: "#111827",
  },

  accessoryContainer: {
    backgroundColor: "#F8FAFC",
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: "flex-end",
    borderTopWidth:
      StyleSheet.hairlineWidth,
    borderTopColor: "#CBD5E1",
  },

  doneText: {
    color: "#4A6FE3",
    fontSize: 16,
    fontWeight: "700",
  },

  saveButton: {
    height: 52,
    borderRadius: 14,
    backgroundColor: "#4A6FE3",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,

    shadowColor: "#4A6FE3",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 4,
    },

    elevation: 3,
  },

  saveButtonPressed: {
    backgroundColor: "#3559C7",
    transform: [{ scale: 0.985 }],
  },

  saveText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },

  skipButton: {
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 5,
  },

  skipButtonPressed: {
    opacity: 0.6,
  },

  skipText: {
    color: "#64748B",
    fontSize: 14,
    fontWeight: "600",
  },
});