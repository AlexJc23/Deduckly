import React, { useEffect } from "react";
import {
  Animated,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { ExpenseCategory } from "../types/expense";

import { EXPENSE_CATEGORY_LABELS } from "@/constants/expense-category-labels";

type Props = {
  visible: boolean;
  value: ExpenseCategory;
  onClose: () => void;
  onSelect: (category: ExpenseCategory) => void;
};

export function ExpenseCategoryModal({
  visible,
  value,
  onClose,
  onSelect,
}: Props) {
  const translateY = React.useRef(new Animated.Value(500)).current;

  useEffect(() => {
    if (visible) {
      translateY.setValue(500);

      Animated.timing(translateY, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, translateY]);

  const handleClose = () => {
    Animated.timing(translateY, {
      toValue: 500,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      onClose();
    });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
    >
      <View style={styles.backdrop}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={handleClose}
        />

        <Animated.View
          style={[
            styles.sheet,
            {
              transform: [{ translateY }],
            },
          ]}
        >
          <Text style={styles.title}>Expense Category</Text>

          <ScrollView showsVerticalScrollIndicator={false}>
            {(Object.keys(
              EXPENSE_CATEGORY_LABELS
            ) as ExpenseCategory[]).map((category) => (
              <Pressable
                key={category}
                style={[
                  styles.option,
                  value === category && styles.optionActive,
                ]}
                onPress={() => {
                  onSelect(category);
                  handleClose();
                }}
              >
                <Text
                  style={[
                    styles.optionText,
                    value === category &&
                      styles.optionTextActive,
                  ]}
                >
                  {EXPENSE_CATEGORY_LABELS[category]}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          <Pressable
            style={styles.cancelButton}
            onPress={handleClose}
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
    backgroundColor: "rgba(0,0,0,.45)",
  },

  sheet: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "75%",
    padding: 24,
  },

  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 16,
  },

  option: {
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },

  optionActive: {
    backgroundColor: "#EFF6FF",
    borderRadius: 12,
    paddingHorizontal: 12,
  },

  optionText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },

  optionTextActive: {
    color: "#2563EB",
  },

  cancelButton: {
    marginTop: 16,
    alignItems: "center",
    paddingVertical: 14,
  },

  cancelText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6B7280",
  },
});