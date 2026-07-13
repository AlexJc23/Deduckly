import {
  Modal,
  View,
  Text,
  TextInput,
  Pressable,
  Animated,
  Easing,
  StyleSheet,
} from "react-native";
import { useEffect, useRef, useState } from "react";

type DeleteAccountModalProps = {
  visible: boolean;
  onClose: () => void;
  onDelete: () => Promise<void>;
};

export default function DeleteAccountModal({
  visible,
  onClose,
  onDelete,
}: DeleteAccountModalProps) {
  const [isMounted, setIsMounted] = useState(visible);
  const [confirmation, setConfirmation] = useState("");

  const translateY = useRef(
    new Animated.Value(420)
  ).current;

  useEffect(() => {
    if (visible) {
      setIsMounted(true);

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
        setIsMounted(false);
        setConfirmation("");
      });
    }
  }, [visible]);

  const canDelete =
    confirmation === "DELETE";

  return (
    <Modal
      visible={isMounted}
      transparent
      animationType="none"
    >
      <View
        style={{
          flex: 1,
          justifyContent: "flex-end",
        }}
      >
        <Pressable
          style={{
            ...StyleSheet.absoluteFillObject,
            backgroundColor:
              "rgba(0,0,0,0.5)",
          }}
          onPress={onClose}
        />

        <Animated.View
          style={{
            transform: [{ translateY }],
            backgroundColor: "white",
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            padding: 24,
            minHeight: 420,
          }}
        >
          <Text
            style={{
              fontSize: 22,
              fontWeight: "600",
              marginBottom: 16,
            }}
          >
            Delete Account
          </Text>

          <Text
            style={{
              marginBottom: 24,
            }}
          >
            This action cannot be undone.
            All trips, expenses, income,
            subscriptions, and account
            data will be permanently
            deleted.
          </Text>

          <TextInput
            placeholder="Type DELETE"
            value={confirmation}
            onChangeText={setConfirmation}
            autoCapitalize="characters"
            style={{
              borderWidth: 1,
              borderColor: "#DDD",
              borderRadius: 12,
              padding: 14,
              marginBottom: 24,
            }}
          />

          <Pressable
            disabled={!canDelete}
            onPress={onDelete}
            style={{
              backgroundColor: canDelete
                ? "#FF3B30"
                : "#C7C7CC",
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
              Delete Account
            </Text>
          </Pressable>

          <Pressable
            onPress={onClose}
            style={{
              alignItems: "center",
              padding: 12,
            }}
          >
            <Text>Cancel</Text>
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  );
}