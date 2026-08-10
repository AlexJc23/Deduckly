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
  const translateY = React.useRef(
    new Animated.Value(500),
  ).current;

  useEffect(() => {
    if (visible) {
      translateY.setValue(500);

      Animated.timing(translateY, {
        toValue: 0,
        duration: 280,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, translateY]);

  const handleClose = () => {
    Animated.timing(translateY, {
      toValue: 500,
      duration: 220,
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
            <View>
              <Text style={styles.eyebrow}>
                EXPENSE
              </Text>

              <Text style={styles.title}>
                Category
              </Text>
            </View>

            <Pressable
              style={styles.closeButton}
              onPress={handleClose}
            >
              <Text style={styles.closeText}>
                ×
              </Text>
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={
              styles.options
            }
          >
            {(
              Object.keys(
                EXPENSE_CATEGORY_LABELS,
              ) as ExpenseCategory[]
            ).map((category) => {
              const isSelected =
                value === category;

              return (
                <Pressable
                  key={category}
                  style={[
                    styles.option,
                    isSelected &&
                      styles.optionActive,
                  ]}
                  onPress={() => {
                    onSelect(category);
                    handleClose();
                  }}
                >
                  <View
                    style={[
                      styles.radio,
                      isSelected &&
                        styles.radioActive,
                    ]}
                  >
                    {isSelected && (
                      <View
                        style={
                          styles.radioDot
                        }
                      />
                    )}
                  </View>

                  <Text
                    style={[
                      styles.optionText,
                      isSelected &&
                        styles.optionTextActive,
                    ]}
                  >
                    {
                      EXPENSE_CATEGORY_LABELS[
                        category
                      ]
                    }
                  </Text>
                </Pressable>
              );
            })}
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
    backgroundColor:
      "rgba(15, 23, 42, 0.42)",
  },

  sheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: "78%",
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 24,
  },

  handle: {
    alignSelf: "center",
    width: 38,
    height: 4,
    borderRadius: 999,
    backgroundColor: "#D8DEE8",
    marginBottom: 20,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  eyebrow: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.2,
    color: "#94A3B8",
    marginBottom: 3,
  },

  title: {
    fontSize: 23,
    fontWeight: "800",
    letterSpacing: -0.4,
    color: "#273449",
  },

  closeButton: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F1F4F8",
  },

  closeText: {
    fontSize: 24,
    lineHeight: 25,
    fontWeight: "400",
    color: "#64748B",
  },

  options: {
    paddingTop: 4,
    paddingBottom: 4,
  },

  option: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    borderRadius: 14,
    marginBottom: 5,
  },

  optionActive: {
    backgroundColor: "#EEF2FF",
  },

  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#CBD5E1",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  radioActive: {
    borderColor: "#4A6FE3",
  },

  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#4A6FE3",
  },

  optionText: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: "#334155",
  },

  optionTextActive: {
    color: "#3B5FCC",
    fontWeight: "700",
  },

  cancelButton: {
    marginTop: 12,
    borderRadius: 14,
    backgroundColor: "#F1F4F8",
    alignItems: "center",
    paddingVertical: 14,
  },

  cancelText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#475569",
  },
});