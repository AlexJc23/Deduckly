import {
  ActivityIndicator,
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
} from "react-native";
import { useState } from "react";

type DeleteExpenseModalProps = {
  visible: boolean;
  onClose: () => void;
  onDelete: () => void | Promise<void>;
};

export function DeleteExpenseModal({
  visible,
  onClose,
  onDelete,
}: DeleteExpenseModalProps) {
  const [isDeleting, setIsDeleting] =
    useState(false);

  async function handleDelete() {
    if (isDeleting) return;

    try {
      setIsDeleting(true);
      await onDelete();
    } catch (error) {
      console.error(
        "Failed to delete expense:",
        error,
      );
      setIsDeleting(false);
    }
  }

  function handleClose() {
    if (isDeleting) return;

    onClose();
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>
            Delete Expense?
          </Text>

          <Text style={styles.description}>
            This will permanently delete this
            expense. This action cannot be undone.
          </Text>

          <View style={styles.buttonRow}>
            <Pressable
              disabled={isDeleting}
              style={[
                styles.button,
                styles.cancelButton,
                isDeleting &&
                  styles.disabledButton,
              ]}
              onPress={handleClose}
            >
              <Text style={styles.cancelText}>
                Cancel
              </Text>
            </Pressable>

            <Pressable
              disabled={isDeleting}
              style={[
                styles.button,
                styles.deleteButton,
                isDeleting &&
                  styles.disabledDeleteButton,
              ]}
              onPress={handleDelete}
            >
              {isDeleting ? (
                <View style={styles.loadingContent}>
                  <ActivityIndicator
                    size="small"
                    color="#FFFFFF"
                  />

                  <Text style={styles.deleteText}>
                    Deleting...
                  </Text>
                </View>
              ) : (
                <Text style={styles.deleteText}>
                  Delete Expense
                </Text>
              )}
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
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 12,
    textAlign: "center",
    color: "#111827",
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
    justifyContent: "center",
  },

  cancelButton: {
    backgroundColor: "#F3F4F6",
  },

  deleteButton: {
    backgroundColor: "#EF4444",
  },

  disabledButton: {
    opacity: 0.5,
  },

  disabledDeleteButton: {
    opacity: 0.7,
  },

  loadingContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  cancelText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },

  deleteText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});