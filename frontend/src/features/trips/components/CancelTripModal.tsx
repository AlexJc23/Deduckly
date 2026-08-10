import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

type CancelTripModalProps = {
  visible: boolean;
  onClose: () => void;
  onCancel: () => void;
};

export function CancelTripModal({
  visible,
  onClose,
  onCancel,
}: CancelTripModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.iconContainer}>
            <Ionicons
              name="close-circle-outline"
              size={26}
              color="#DC2626"
            />
          </View>

          <Text style={styles.title}>
            Cancel Trip?
          </Text>

          <Text style={styles.description}>
            This will cancel the current active trip.
          </Text>

          <View style={styles.buttonRow}>
            <Pressable
              style={({ pressed }) => [
                styles.button,
                styles.cancelButton,
                pressed && styles.cancelButtonPressed,
              ]}
              onPress={onClose}
            >
              <Text style={styles.cancelText}>
                Keep Trip
              </Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.button,
                styles.deleteButton,
                pressed && styles.deleteButtonPressed,
              ]}
              onPress={onCancel}
            >
              <Ionicons
                name="close"
                size={17}
                color="#FFFFFF"
              />

              <Text style={styles.deleteText}>
                Cancel Trip
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.62)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },

  modal: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 22,

    shadowColor: "#000000",
    shadowOpacity: 0.2,
    shadowRadius: 24,
    shadowOffset: {
      width: 0,
      height: 8,
    },

    elevation: 12,
  },

  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#FEE2E2",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: 14,
  },

  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#111827",
    textAlign: "center",
    letterSpacing: -0.4,
  },

  description: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 20,
    marginTop: 7,
    marginBottom: 24,
  },

  buttonRow: {
    flexDirection: "row",
    gap: 10,
  },

  button: {
    flex: 1,
    minHeight: 50,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 7,
  },

  cancelButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  cancelButtonPressed: {
    backgroundColor: "#F8FAFC",
    transform: [{ scale: 0.985 }],
  },

  deleteButton: {
    backgroundColor: "#DC2626",

    shadowColor: "#DC2626",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 3,
    },

    elevation: 3,
  },

  deleteButtonPressed: {
    backgroundColor: "#B91C1C",
    transform: [{ scale: 0.985 }],
  },

  cancelText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
  },

  deleteText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});