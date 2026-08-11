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
import Ionicons from "@expo/vector-icons/Ionicons";
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
  mode: "create" | "edit";
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
  mode,
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
      style={styles.screen}
      contentContainerStyle={
        styles.container
      }
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.header}>
  <Text style={styles.eyebrow}>
    EXPENSE
  </Text>

  <Text style={styles.title}>
    {mode === "create"
      ? "Add Expense"
      : "Edit Expense"}
  </Text>

  <Text style={styles.subtitle}>
    {mode === "create"
      ? "Keep your business expenses organized and ready for reporting."
      : "Update your expense details and keep your records accurate."}
  </Text>
</View>

      <View style={styles.card}>
        <Text style={styles.label}>
          Amount
        </Text>

        <View style={styles.amountContainer}>
          <Text style={styles.currency}>
            $
          </Text>

          <TextInput
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
            style={styles.amountInput}
            placeholder="0.00"
            placeholderTextColor="#94A3B8"
          />
        </View>

        <Text style={styles.label}>
          Category
        </Text>

        <Pressable
          style={({ pressed }) => [
            styles.selectInput,
            pressed &&
              styles.selectInputPressed,
          ]}
          onPress={() =>
            setShowCategoryModal(true)
          }
        >
          <View style={styles.selectIcon}>
            <Ionicons
              name="grid-outline"
              size={17}
              color="#4A6FE3"
            />
          </View>

          <Text style={styles.inputText}>
            {
              EXPENSE_CATEGORY_LABELS[
                category
              ]
            }
          </Text>

          <Ionicons
            name="chevron-down"
            size={17}
            color="#94A3B8"
          />
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
          <View style={styles.dateIcon}>
            <Ionicons
              name="calendar-outline"
              size={18}
              color="#4A6FE3"
            />
          </View>

          <DateTimePicker
            value={incurredAt}
            mode="date"
            display="compact"
            maximumDate={new Date()}
            onChange={(_, date) => {
              if (date) {
                setIncurredAt(date);
              }
            }}
          />
        </View>

        <Text style={styles.label}>
          Business %
        </Text>

        <View style={styles.inputWithIcon}>
          <TextInput
            value={businessPercentage}
            onChangeText={
              setBusinessPercentage
            }
            keyboardType="decimal-pad"
            style={styles.input}
            placeholder="100"
            placeholderTextColor="#94A3B8"
          />

          <Text style={styles.percent}>
            %
          </Text>
        </View>

        <Text style={styles.label}>
          Merchant
        </Text>

        <TextInput
          value={merchant}
          onChangeText={setMerchant}
          style={styles.input}
          placeholder="Optional"
          placeholderTextColor="#94A3B8"
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
          placeholderTextColor="#94A3B8"
        />
      </View>

      <View style={styles.receipt}>
        <View style={styles.receiptHeader}>
          <View style={styles.receiptIcon}>
            <Ionicons
              name="receipt-outline"
              size={19}
              color="#4A6FE3"
            />
          </View>

          <View style={styles.receiptHeaderText}>
            <Text style={styles.receiptTitle}>
              Receipt
            </Text>

            <Text style={styles.receiptSubtitle}>
              Attach a receipt for your records.
            </Text>
          </View>
        </View>

        {!receiptUri && (
          <View style={styles.noReceipt}>
            <Ionicons
              name="document-outline"
              size={22}
              color="#94A3B8"
            />

            <Text
              style={
                styles.receiptPlaceholder
              }
            >
              No receipt attached
            </Text>
          </View>
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
              style={({ pressed }) => [
                styles.receiptButton,
                pressed &&
                  styles.receiptButtonPressed,
              ]}
              onPress={
                onChoosePhoto
              }
            >
              <Ionicons
                name="image-outline"
                size={18}
                color="#334155"
              />

              <Text
                style={
                  styles.receiptButtonText
                }
              >
                Replace Receipt
              </Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.removeButton,
                pressed &&
                  styles.removeButtonPressed,
              ]}
              onPress={() =>
                setReceiptUri(null)
              }
            >
              <Ionicons
                name="trash-outline"
                size={17}
                color="#EF4444"
              />

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
          <View style={styles.receiptActions}>
            <Pressable
              style={({ pressed }) => [
                styles.receiptButton,
                pressed &&
                  styles.receiptButtonPressed,
              ]}
              onPress={
                onTakePhoto
              }
            >
              <Ionicons
                name="camera-outline"
                size={18}
                color="#334155"
              />

              <Text
                style={
                  styles.receiptButtonText
                }
              >
                Take Photo
              </Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.receiptButton,
                pressed &&
                  styles.receiptButtonPressed,
              ]}
              onPress={
                onChoosePhoto
              }
            >
              <Ionicons
                name="images-outline"
                size={18}
                color="#334155"
              />

              <Text
                style={
                  styles.receiptButtonText
                }
              >
                Choose From Library
              </Text>
            </Pressable>
          </View>
        )}
      </View>

      <Pressable
        disabled={
          loading ||
          !isFormValid
        }
        style={({ pressed }) => [
          styles.button,
          (loading ||
            !isFormValid) &&
            styles.buttonDisabled,
          pressed &&
            isFormValid &&
            !loading &&
            styles.buttonPressed,
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
        <Text style={styles.buttonText}>
          {loading
            ? "Saving..."
            : submitLabel}
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  container: {
    padding: 20,
    paddingBottom: 48,
  },

  header: {
    marginBottom: 20,
  },

  eyebrow: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.2,
    color: "#64748B",
    marginBottom: 4,
  },

  title: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "800",
    letterSpacing: -0.7,
    color: "#111827",
  },

  subtitle: {
    marginTop: 5,
    fontSize: 14,
    lineHeight: 20,
    color: "#64748B",
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 18,
  },

  label: {
    fontSize: 13,
    fontWeight: "700",
    color: "#334155",
    marginBottom: 8,
    marginTop: 18,
  },

  amountContainer: {
    height: 58,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 15,
  },

  currency: {
    fontSize: 24,
    fontWeight: "700",
    color: "#64748B",
    marginRight: 5,
  },

  amountInput: {
    flex: 1,
    height: "100%",
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
  },

  selectInput: {
    minHeight: 50,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 12,
  },

  selectInputPressed: {
    backgroundColor: "#F1F5F9",
    transform: [{ scale: 0.99 }],
  },

  selectIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#DCE6FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  inputText: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
  },

  date: {
    minHeight: 50,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 13,
    paddingHorizontal: 12,
    backgroundColor: "#F8FAFC",
  },

  dateIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#DCE6FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },

  inputWithIcon: {
    position: "relative",
  },

  input: {
    minHeight: 50,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 13,
    paddingHorizontal: 14,
    fontSize: 15,
    backgroundColor: "#F8FAFC",
    color: "#111827",
  },

  percent: {
    position: "absolute",
    right: 15,
    top: 16,
    fontSize: 14,
    fontWeight: "700",
    color: "#64748B",
  },

  multiline: {
    minHeight: 110,
    paddingTop: 14,
    textAlignVertical: "top",
  },

  receipt: {
    marginTop: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 18,
  },

  receiptHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  receiptIcon: {
    width: 40,
    height: 40,
    borderRadius: 11,
    backgroundColor: "#DCE6FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },

  receiptHeaderText: {
    flex: 1,
  },

  receiptTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },

  receiptSubtitle: {
    marginTop: 2,
    fontSize: 12,
    color: "#64748B",
  },

  noReceipt: {
    minHeight: 90,
    marginTop: 16,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#CBD5E1",
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8FAFC",
  },

  receiptPlaceholder: {
    marginTop: 7,
    fontSize: 13,
    color: "#94A3B8",
  },

  receiptPreview: {
    width: "100%",
    height: 220,
    borderRadius: 13,
    resizeMode: "cover",
    marginTop: 16,
    marginBottom: 4,
  },

  receiptActions: {
    marginTop: 6,
    gap: 2,
  },

  receiptButton: {
    minHeight: 48,
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 14,
    backgroundColor: "#FFFFFF",
    marginTop: 10,
  },

  receiptButtonPressed: {
    backgroundColor: "#F8FAFC",
    transform: [{ scale: 0.99 }],
  },

  receiptButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#334155",
  },

  removeButton: {
    minHeight: 42,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    marginTop: 6,
  },

  removeButtonPressed: {
    opacity: 0.6,
  },

  removeText: {
    color: "#EF4444",
    fontWeight: "700",
    fontSize: 14,
  },

  button: {
    minHeight: 52,
    marginTop: 18,
    backgroundColor: "#4A6FE3",
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },

  buttonPressed: {
    backgroundColor: "#3559C7",
    transform: [{ scale: 0.985 }],
  },

  buttonDisabled: {
    backgroundColor: "#94A3B8",
    opacity: 0.7,
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
});