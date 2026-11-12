import { RecordFormLayout, recordFormStyles } from "@/components/ui/RecordFormLayout";
import { VehicleAssignment } from '@/features/vehicles/VehicleAssignment';
import { useLanguage, Translated } from "@/i18n/language";
import { localizedAlert } from "@/i18n/alerts";
import { Pressable, Text, TextInput, View } from "@/theme/components";
import { useEffect, useMemo, useState } from "react";
import { Linking, Platform, Image, StyleSheet } from "react-native";
import { Ionicons } from "@/theme/icons";
import DateTimePicker from "@/components/ui/DateField";
import { isDevice } from "expo-device";
import * as ImagePicker from "expo-image-picker";

import { ExpenseCategory } from "../types/expense";
import { ExpenseCategoryModal } from "../modals/ExpenseCategoryModal";
import { EXPENSE_CATEGORY_LABELS } from "@/constants/expense-category-labels";

export interface ExpenseFormValues {
  vehicleId?:string|null;
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
  const { locale, t } = useLanguage();
  const canTakePhoto = Platform.OS !== "ios" || isDevice;
  const [vehicleId,setVehicleId]=useState(initialValues.vehicleId??null);
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

  const {
    amount: savedAmount, category: savedCategory, merchant: savedMerchant, description: savedDescription,
    businessPercentage: savedPercentage, vehicleId: savedVehicleId, incurredAt: savedDate,
  } = initialValues;
  const savedTime = savedDate.getTime();
  useEffect(() => {
    setVehicleId(savedVehicleId ?? null);
    setAmount(savedAmount);
    setCategory(savedCategory);
    setMerchant(savedMerchant);
    setDescription(savedDescription);
    setBusinessPercentage(savedPercentage);
    setIncurredAt(new Date(savedTime));
  }, [savedVehicleId, savedAmount, savedCategory, savedMerchant, savedDescription, savedPercentage, savedTime]);
  useEffect(() => {
    setReceiptUri(initialReceiptUri ?? null);
  }, [initialReceiptUri]);

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
    // UIKit can terminate the app when its camera source is unavailable on iOS Simulator.
    if (!canTakePhoto) return;

    let permission = await ImagePicker.getCameraPermissionsAsync();
    if (!permission.granted && permission.canAskAgain && (Platform.OS !== "ios" || permission.status === "undetermined")) {
      permission = await ImagePicker.requestCameraPermissionsAsync();
    }

    if (!permission.granted) {
      localizedAlert(
        "Camera Permission",
        "Camera access is needed to photograph a receipt. You can change it in Settings or choose an existing photo.",
        [{ text: "Cancel", style: "cancel" }, { text: "Open Settings", onPress: () => { void Linking.openSettings().catch(() => {}); } }],
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
    // The system image picker grants access to the selected receipt only.
    // No full-library permission is needed for this image-only selection flow.
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
    <RecordFormLayout
      main={
        <View style={recordFormStyles.card}>
          <Text style={recordFormStyles.label}>
            <Translated text={"Amount"} /></Text>

          <View style={styles.amountContainer}>
            <Text style={styles.currency}>
              $
            </Text>

            <TextInput
              accessibilityLabel="Amount"
            value={amount}
              onChangeText={Platform.OS === "android" ? value => setAmount(value.replace(",", ".")) : setAmount}
              keyboardType="decimal-pad"
              style={styles.amountInput}
              placeholder="0.00"
              placeholderTextColor="#94A3B8"
            />
          </View>

          <Text style={[recordFormStyles.label, styles.fieldSpacing]}>
            <Translated text={"Category"} /></Text>

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

          <Text style={[recordFormStyles.label, styles.fieldSpacing]}>
            <Translated text={"Date"} /></Text>

          <View style={styles.date}>
            <View style={styles.dateIcon}>
              <Ionicons
                name="calendar-outline"
                size={18}
                color="#4A6FE3"
              />
            </View>

            <DateTimePicker locale={locale}
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

          <Text style={[recordFormStyles.label, styles.fieldSpacing]}>
            <Translated text={"Business %"} /></Text>

          <View style={styles.inputWithIcon}>
            <TextInput
              accessibilityLabel="Business %"
            value={businessPercentage}
              onChangeText={
                Platform.OS === "android" ? value => setBusinessPercentage(value.replace(",", ".")) : setBusinessPercentage
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

          <Text style={[recordFormStyles.label, styles.fieldSpacing]}>
            <Translated text={"Merchant"} /></Text>

          <TextInput
            accessibilityLabel="Merchant"
            value={merchant}
            onChangeText={setMerchant}
            style={styles.input}
            placeholder="Optional"
            placeholderTextColor="#94A3B8"
          />

          <Text style={[recordFormStyles.label, styles.fieldSpacing]}>
            <Translated text={"Description"} /></Text>

          <TextInput
            accessibilityLabel="Description"
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
      }
      aside={
        <>
          <View style={recordFormStyles.card}>
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
                  <Translated text={"Receipt"} /></Text>

                <Text style={styles.receiptSubtitle}>
                  <Translated text={"Attach a receipt for your records."} /></Text>
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
                  <Translated text={"No receipt attached"} /></Text>
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
                    <Translated text={"Replace Receipt"} /></Text>
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
                    <Translated text={"Remove Receipt"} /></Text>
                </Pressable>
              </>
            ) : (
              <View style={styles.receiptActions}>
                {canTakePhoto && (
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
                      <Translated text={"Take Photo"} /></Text>
                  </Pressable>
                )}

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
                    <Translated text={"Choose From Library"} /></Text>
                </Pressable>
              </View>
            )}
          </View>
          <View style={recordFormStyles.card}>
            <VehicleAssignment value={vehicleId} onChange={setVehicleId} disabled={loading} />
          </View>
        </>
      }
      actions={
        <Pressable
          accessibilityRole="button"
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
                businessPercentage, vehicleId,
                incurredAt,
              },
              receiptUri,
            )
          }
        >
          <Text style={styles.buttonText}>
            {loading
              ? <Translated text={"Saving..."} />
              : t(submitLabel)}
          </Text>
        </Pressable>
      }
    />
  );
}

const styles = StyleSheet.create({
  fieldSpacing: { marginTop: 16 },
  amountContainer: {
    minHeight: 58,
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
    minWidth: 0,
    paddingVertical: 10,
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
    textAlign: "center",
    fontSize: 13,
    color: "#94A3B8",
  },

  receiptPreview: {
    width: "100%",
    height: 220,
    borderRadius: 13,
    resizeMode: "contain",
    backgroundColor: "#F1F5F9",
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
    paddingVertical: 8,
    backgroundColor: "#FFFFFF",
    marginTop: 10,
  },

  receiptButtonPressed: {
    backgroundColor: "#F8FAFC",
    transform: [{ scale: 0.99 }],
  },

  receiptButtonText: {
    flexShrink: 1,
    textAlign: "center",
    fontSize: 14,
    fontWeight: "600",
    color: "#334155",
  },

  removeButton: {
    minHeight: 48,
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
    padding: 12,
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