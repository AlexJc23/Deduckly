import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
} from "react-native";

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
          <Text style={styles.title}>
            Cancel Trip?
          </Text>

          <Text style={styles.description}>
            This will cancel the current active trip.

          </Text>

          <View style={styles.buttonRow}>
            <Pressable
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
            >
              <Text style={styles.cancelText}>
                Cancel
              </Text>
            </Pressable>

            <Pressable
              style={[styles.button, styles.deleteButton]}
              onPress={onCancel}
            >
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
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },

  modal: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 24,
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 12,
    textAlign: "center",
  },

  description: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 28,
  },

  buttonRow: {
    flexDirection: "row",
    gap: 12,
  },

  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },

  cancelButton: {
    backgroundColor: "#F3F4F6",
  },

  deleteButton: {
    backgroundColor: "#EF4444",
  },

  cancelText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },

  deleteText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
});
