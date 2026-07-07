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

  const inputAccessoryViewID = "incomeKeyboard";

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{
          flex: 1,
          justifyContent: "flex-end",
        }}
      >
        <Pressable
          style={{
            ...StyleSheet.absoluteFillObject,
            backgroundColor: "rgba(0,0,0,0.5)",
          }}
          onPress={onSkip}
        />

        <Animated.View
          style={{
            transform: [{ translateY }],
            backgroundColor: "white",
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            padding: 24,
            minHeight: 350,
          }}
        >
          <Text
            style={{
              fontSize: 22,
              fontWeight: "600",
              marginBottom: 24,
            }}
          >
            Trip Complete 🎉
          </Text>

          <Text
            style={{
              marginBottom: 12,
            }}
          >
            Income (Optional)
          </Text>

          <TextInput
            value={income}
            onChangeText={setIncome}
            keyboardType="decimal-pad"
            placeholder="$0.00"
            inputAccessoryViewID={inputAccessoryViewID}
            style={{
              borderWidth: 1,
              borderColor: "#DDD",
              borderRadius: 12,
              padding: 14,
              marginBottom: 32,
            }}
          />

          <InputAccessoryView nativeID={inputAccessoryViewID}>
            <View
              style={{
                backgroundColor: "#F2F2F7",
                paddingVertical: 8,
                paddingHorizontal: 16,
                alignItems: "flex-end",
                borderTopWidth: StyleSheet.hairlineWidth,
                borderTopColor: "#CCC",
              }}
            >
              <Pressable onPress={Keyboard.dismiss}>
                <Text
                  style={{
                    color: "#007AFF",
                    fontSize: 17,
                    fontWeight: "600",
                  }}
                >
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
            style={{
              backgroundColor: "#007AFF",
              padding: 16,
              borderRadius: 12,
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <Text
              style={{
                color: "white",
                fontWeight: "600",
              }}
            >
              Save Trip
            </Text>
          </Pressable>

          <Pressable
            onPress={() => {
              Keyboard.dismiss();
              onSkip();
            }}
            style={{
              padding: 16,
              alignItems: "center",
            }}
          >
            <Text>Skip</Text>
          </Pressable>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
