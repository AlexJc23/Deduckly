import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  StyleSheet,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as ImagePicker from "expo-image-picker";

import { ExpenseCategory } from "../types/expense";
import { ExpenseCategoryModal } from "../modals/ExpenseCategoryModal";
import { EXPENSE_CATEGORY_LABELS } from "@/constants/expense-category-labels";

export interface ExpenseFormValues {
  amount: string;
  category: ExpenseCategory;
  merchant: string;
  description: string;
  businessPercentage: string;
  incurredAt: Date;
}

type Props = {
  initialValues: ExpenseFormValues;
  initialReceiptUri?: string | null;
  submitLabel: string;
  loading?: boolean;
  onSubmit: (
    values: ExpenseFormValues,
    receiptUri: string | null,
  ) => void;
};

export function ExpenseForm({
  initialValues,
  initialReceiptUri,
  submitLabel,
  loading = false,
  onSubmit,
}: Props) {
  const [amount, setAmount] = useState(
    initialValues.amount,
  );

  const [category, setCategory] =
    useState<ExpenseCategory>(
      initialValues.category,
    );

  const [merchant, setMerchant] =
    useState(initialValues.merchant);

  const [description, setDescription] =
    useState(initialValues.description);

  const [
    businessPercentage,
    setBusinessPercentage,
  ] = useState(
    initialValues.businessPercentage,
  );

  const [incurredAt, setIncurredAt] =
    useState(initialValues.incurredAt);

  const [
    showCategoryModal,
    setShowCategoryModal,
  ] = useState(false);

  const [receiptUri, setReceiptUri] =
    useState<string | null>(
      initialReceiptUri ?? null,
    );

  useEffect(() => {
    setAmount(initialValues.amount);
    setCategory(initialValues.category);
    setMerchant(initialValues.merchant);
    setDescription(
      initialValues.description,
    );
    setBusinessPercentage(
      initialValues.businessPercentage,
    );
    setIncurredAt(
      initialValues.incurredAt,
    );
    setReceiptUri(
      initialReceiptUri ?? null,
    );
  }, [
    initialValues,
    initialReceiptUri,
  ]);

  const isFormValid = useMemo(() => {
    return (
      amount.trim() !== "" &&
      !isNaN(Number(amount)) &&
      Number(amount) > 0 &&
      businessPercentage.trim() !== "" &&
      !isNaN(
        Number(businessPercentage),
      )
    );
  }, [
    amount,
    businessPercentage,
  ]);

  async function onTakePhoto() {
    const permission =
      await ImagePicker.requestCameraPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        "Camera Permission",
        "Camera permission is required.",
      );
      return;
    }

    const result =
      await ImagePicker.launchCameraAsync({
        mediaTypes: ["images"],
        quality: 0.8,
      });

    if (!result.canceled) {
      setReceiptUri(
        result.assets[0].uri,
      );
    }
  }

  async function onChoosePhoto() {
    const permission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        "Photos Permission",
        "Photo library permission is required.",
      );
      return;
    }

    const result =
      await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        quality: 0.8,
      });

    if (!result.canceled) {
      setReceiptUri(
        result.assets[0].uri,
      );
    }
  }

  return (
    <ScrollView
      contentContainerStyle={
        styles.container
      }
    >
      <Text style={styles.label}>
        Amount
      </Text>

      <TextInput
        value={amount}
        onChangeText={setAmount}
        keyboardType="decimal-pad"
        style={styles.input}
        placeholder="0.00"
      />

      <Text style={styles.label}>
        Category
      </Text>

      <Pressable
        style={styles.input}
        onPress={() =>
          setShowCategoryModal(true)
        }
      >
        <Text style={styles.inputText}>
          {
            EXPENSE_CATEGORY_LABELS[
              category
            ]
          }
        </Text>
      </Pressable>

      <ExpenseCategoryModal
        visible={showCategoryModal}
        value={category}
        onClose={() =>
          setShowCategoryModal(false)
        }
        onSelect={setCategory}
      />

      <Text style={styles.label}>
        Date
      </Text>

      <View style={styles.date}>
        <DateTimePicker
          value={incurredAt}
          mode="date"
          display="compact"
          maximumDate={new Date()}
          onChange={(
            _,
            date,
          ) => {
            if (date) {
              setIncurredAt(date);
            }
          }}
        />
      </View>

      <Text style={styles.label}>
        Business %
      </Text>

      <TextInput
        value={businessPercentage}
        onChangeText={
          setBusinessPercentage
        }
        keyboardType="decimal-pad"
        style={styles.input}
      />

      <Text style={styles.label}>
        Merchant
      </Text>

      <TextInput
        value={merchant}
        onChangeText={setMerchant}
        style={styles.input}
        placeholder="Optional"
      />

      <Text style={styles.label}>
        Description
      </Text>

      <TextInput
        value={description}
        onChangeText={
          setDescription
        }
        style={[
          styles.input,
          styles.multiline,
        ]}
        multiline
        placeholder="Optional"
      />

      <View style={styles.receipt}>
        <Text
          style={
            styles.receiptTitle
          }
        >
          Receipt
        </Text>

        {!receiptUri && (
          <Text
            style={
              styles.receiptPlaceholder
            }
          >
            No receipt attached
          </Text>
        )}

        {receiptUri ? (
          <>
            <Image
              source={{
                uri: receiptUri,
              }}
              style={
                styles.receiptPreview
              }
            />

            <Pressable
              style={
                styles.receiptButton
              }
              onPress={
                onChoosePhoto
              }
            >
              <Text
                style={
                  styles.receiptButtonText
                }
              >
                Replace Receipt
              </Text>
            </Pressable>

            <Pressable
              style={
                styles.removeButton
              }
              onPress={() =>
                setReceiptUri(
                  null,
                )
              }
            >
              <Text
                style={
                  styles.removeText
                }
              >
                Remove Receipt
              </Text>
            </Pressable>
          </>
        ) : (
          <>
            <Pressable
              style={
                styles.receiptButton
              }
              onPress={
                onTakePhoto
              }
            >
              <Text
                style={
                  styles.receiptButtonText
                }
              >
                📷 Take Photo
              </Text>
            </Pressable>

            <Pressable
              style={
                styles.receiptButton
              }
              onPress={
                onChoosePhoto
              }
            >
              <Text
                style={
                  styles.receiptButtonText
                }
              >
                🖼 Choose From Library
              </Text>
            </Pressable>
          </>
        )}
      </View>

      <Pressable
        disabled={
          loading ||
          !isFormValid
        }
        style={[
          styles.button,
          (loading ||
            !isFormValid) &&
            styles.buttonDisabled,
        ]}
        onPress={() =>
          onSubmit(
            {
              amount,
              category,
              merchant,
              description,
              businessPercentage,
              incurredAt,
            },
            receiptUri,
          )
        }
      >
        <Text
          style={
            styles.buttonText
          }
        >
          {loading
            ? "Saving..."
            : submitLabel}
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const styles =
  StyleSheet.create({
    container: {
      padding: 20,
      paddingBottom: 40,
      gap: 16,
    },

    label: {
      fontSize: 14,
      fontWeight: "600",
      color: "#6B7280",
    },

    input: {
      borderWidth: 1,
      borderColor: "#D1D5DB",
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 12,
      fontSize: 16,
      backgroundColor:
        "#FFFFFF",
    },

    inputText: {
      fontSize: 16,
      color: "#111827",
    },

    multiline: {
      minHeight: 100,
      textAlignVertical: "top",
    },
    receiptPlaceholder: {
      marginTop: 8,
      marginBottom: 12,
      fontSize: 14,
      color: "#6B7280",
      textAlign: "center",
    },

    date: {
      borderWidth: 1,
      borderColor: "#D1D5DB",
      borderRadius: 12,
      padding: 8,
    },

    receipt: {
      borderWidth: 1,
      borderStyle: "dashed",
      borderColor: "#D1D5DB",
      borderRadius: 12,
      padding: 18,
      alignItems: "center",
    },

    receiptTitle: {
      fontSize: 16,
      fontWeight: "700",
      color: "#111827",
      marginBottom: 8,
    },

    receiptPreview: {
      width: "100%",
      height: 220,
      borderRadius: 12,
      resizeMode: "cover",
      marginBottom: 12,
    },

    receiptButton: {
      width: "100%",
      borderWidth: 1,
      borderColor: "#D1D5DB",
      borderRadius: 12,
      paddingVertical: 14,
      alignItems: "center",
      marginTop: 10,
      backgroundColor: "#FFFFFF",
    },

    receiptButtonText: {
      fontSize: 15,
      fontWeight: "600",
      color: "#111827",
    },

    removeButton: {
      marginTop: 12,
    },

    removeText: {
      color: "#DC2626",
      fontWeight: "700",
      fontSize: 15,
    },

    button: {
      marginTop: 12,
      backgroundColor: "#2563EB",
      borderRadius: 12,
      paddingVertical: 16,
      alignItems: "center",
    },

    buttonDisabled: {
      backgroundColor:
        "#9CA3AF",
      opacity: 0.7,
    },

    buttonText: {
      color: "#FFFFFF",
      fontSize: 16,
      fontWeight: "700",
    },
  });