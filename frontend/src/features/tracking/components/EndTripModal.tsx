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
import { useTracking } from "../context/tracking.context";
import { router } from "expo-router";

type EndTripModalProps = {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export function EndTripModal({
  visible,
  onClose,
  onConfirm,
}: EndTripModalProps) {
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
      <View style={styles.container}>
        {/* Backdrop */}
        <Pressable
          style={styles.backdrop}
          onPress={onClose}
        />

        {/* Bottom Sheet */}
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
            <Text style={styles.title}>
              End Trip?
            </Text>

            <Text style={styles.subtitle}>
              This will stop tracking and save your
              trip.
            </Text>
          </View>

          <Pressable
            onPress={() => {}}
            style={styles.emptyButton}
          />

          <Pressable
            onPress={onClose}
            style={({ pressed }) => [
              styles.resumeButton,
              pressed && styles.buttonPressed,
            ]}
          >
            <Text style={styles.resumeText}>
              Resume Trip
            </Text>
          </Pressable>

          <Pressable
            onPress={onConfirm}
            style={({ pressed }) => [
              styles.endButton,
              pressed && styles.endButtonPressed,
            ]}
          >
            <Text style={styles.endText}>
              End Trip
            </Text>
          </Pressable>
        </Animated.View>
      </View>
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
    backgroundColor: "rgba(15, 23, 42, 0.62)",
  },

  sheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 30,
    minHeight: 420,

    shadowColor: "#000000",
    shadowOpacity: 0.18,
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
    marginBottom: 24,
  },

  header: {
    marginBottom: 24,
  },

  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#111827",
    letterSpacing: -0.5,
  },

  subtitle: {
    marginTop: 6,
    fontSize: 14,
    lineHeight: 20,
    color: "#64748B",
  },

  emptyButton: {
    height: 0,
  },

  resumeButton: {
    height: 52,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
  },

  buttonPressed: {
    backgroundColor: "#F8FAFC",
    transform: [{ scale: 0.985 }],
  },

  resumeText: {
    color: "#111827",
    fontSize: 15,
    fontWeight: "700",
  },

  endButton: {
    height: 52,
    borderRadius: 14,
    backgroundColor: "#DC2626",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,

    shadowColor: "#DC2626",
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 4,
    },

    elevation: 3,
  },

  endButtonPressed: {
    backgroundColor: "#B91C1C",
    transform: [{ scale: 0.985 }],
  },

  endText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
});