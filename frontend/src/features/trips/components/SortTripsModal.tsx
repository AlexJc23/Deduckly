import {
  Modal,
  View,
  Text,
  Pressable,
  Animated,
  Easing,
  StyleSheet,
} from "react-native";
import { useEffect, useRef, useState } from "react";

const options = [
  {
    label: "Newest First",
    value: "desc" as const,
  },
  {
    label: "Oldest First",
    value: "asc" as const,
  },
];

type SortTripsModalProps = {
  visible: boolean;
  onClose: () => void;
  value: "asc" | "desc";
  onChange: (value: "asc" | "desc") => void;
};

export function SortTripsModal({
  visible,
  onClose,
  value,
  onChange,
}: SortTripsModalProps) {
  const [isMounted, setIsMounted] = useState(visible);

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
      });
    }
  }, [visible, translateY]);

  return (
    <Modal
      visible={isMounted}
      transparent
      animationType="none"
      onRequestClose={onClose}
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
            backgroundColor: "rgba(0,0,0,0.5)",
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
            minHeight: 320,
          }}
        >
          <Text
            style={{
              fontSize: 22,
              fontWeight: "600",
              marginBottom: 24,
            }}
          >
            Sort Trips
          </Text>

          {options.map((option) => (
            <Pressable
              key={option.value}
              onPress={() => {
                onChange(option.value);
                onClose();
              }}
              style={{
                padding: 16,
                borderRadius: 12,
                borderWidth: 2,
                borderColor:
                  value === option.value
                    ? "#007AFF"
                    : "#DDD",
                marginBottom: 12,
              }}
            >
              <Text
                style={{
                  fontWeight:
                    value === option.value
                      ? "600"
                      : "400",
                }}
              >
                {option.label}
              </Text>
            </Pressable>
          ))}

          <Pressable
            onPress={onClose}
            style={{
              marginTop: 24,
              alignItems: "center",
            }}
          >
            <Text>Cancel</Text>
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  );
}
