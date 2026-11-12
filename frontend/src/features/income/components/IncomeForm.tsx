import { RecordFormLayout, recordFormStyles } from "@/components/ui/RecordFormLayout";
import { PlatformTiles } from '@/components/ui/PlatformTiles';
import { useLanguage, Translated } from "@/i18n/language";
import { Pressable, Text, TextInput, View } from "@/theme/components";
import { useEffect, useState } from "react";
import { Platform, StyleSheet } from "react-native";

import {
  CreateIncomeRequest,
  Income,
  IncomeType,
  TripPlatform,
} from "../types/income";

import { router } from "expo-router";

interface IncomeFormProps {
  initialValues?: Partial<Income>;
  submitLabel?: string;
  loading?: boolean;
  onSubmit: (values: CreateIncomeRequest) => void;
}

const platforms: TripPlatform[] = [
  "uber",
  "uber_eats",
  "lyft",
  "doordash",
  "grubhub",
  "instacart",
  "spark",
  "amazon_flex",
  "shipt",
  "other",
];

export function IncomeForm({
  initialValues,
  submitLabel = "Save",
  loading = false,
  onSubmit,
}: IncomeFormProps) {
  const { t } = useLanguage();
  const [amount, setAmount] = useState("");
  const [source, setSource] =
    useState<IncomeType>("gig_platform");
  const [platform, setPlatform] =
    useState<TripPlatform>("doordash");
  const [businessName, setBusinessName] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!initialValues) return;

    setAmount(initialValues.amount?.toString() ?? "");
    setSource(
      initialValues.source ?? "gig_platform",
    );
    setPlatform(
      initialValues.platform ?? "doordash",
    );
    setBusinessName(
      initialValues.business_name ?? "",
    );
    setNotes(initialValues.notes ?? "");
  }, [initialValues]);

  function handleSubmit() {
    if (Platform.OS === "android" && (loading || !Number.isFinite(Number(amount)) || Number(amount) <= 0)) return;
    onSubmit({
      amount: Number(amount),
      source,
      platform:
        source === "gig_platform"
          ? platform
          : undefined,
      business_name:
        source === "business"
          ? businessName
          : undefined,
      notes: notes || undefined,
      received_at: initialValues?.received_at
        ? initialValues.received_at : new Date().toISOString(),
    });

    // Android waits for the screen mutation success callback before leaving.
    if (Platform.OS !== "android") router.back();
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
              style={styles.amountInput}
              accessibilityLabel="Amount"
              keyboardType="decimal-pad"
              value={amount}
              onChangeText={Platform.OS === "android" ? value => setAmount(value.replace(",", ".")) : setAmount}
              placeholder="0.00"
              placeholderTextColor="#94A3B8"
            />
          </View>

          <Text style={[recordFormStyles.label, styles.fieldSpacing]}>
            <Translated text={"Income Source"} /></Text>

          <View style={styles.row}>
            <Pressable
              style={({ pressed }) => [
                styles.choice,
                source === "gig_platform" &&
                  styles.choiceActive,
                pressed && styles.choicePressed,
              ]}
              accessibilityRole="button"
              accessibilityState={{ selected: source === "gig_platform" }}
              onPress={() =>
                setSource("gig_platform")
              }
            >
              <Text
                style={[
                  styles.choiceText,
                  source === "gig_platform" &&
                    styles.choiceTextActive,
                ]}
              >
                <Translated text={"Gig Platform"} /></Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.choice,
                source === "business" &&
                  styles.choiceActive,
                pressed && styles.choicePressed,
              ]}
              accessibilityRole="button"
              accessibilityState={{ selected: source === "business" }}
              onPress={() =>
                setSource("business")
              }
            >
              <Text
                style={[
                  styles.choiceText,
                  source === "business" &&
                    styles.choiceTextActive,
                ]}
              >
                <Translated text={"Business"} /></Text>
            </Pressable>
          </View>

          {source === "gig_platform" && (
            <>
              <Text style={[recordFormStyles.label, styles.fieldSpacing]}>
                <Translated text={"Platform"} /></Text>

              <PlatformTiles platforms={platforms} value={platform} onChange={value => { if (value) setPlatform(value as TripPlatform); }} disabled={loading} />
            </>
          )}

          {source === "business" && (
            <>
              <Text style={[recordFormStyles.label, styles.fieldSpacing]}>
                <Translated text={"Business Name"} /></Text>

              <TextInput
                style={styles.input}
                accessibilityLabel="Business Name"
                value={businessName}
                onChangeText={setBusinessName}
                placeholder="Business Name"
                placeholderTextColor="#94A3B8"
              />
            </>
          )}
        </View>
      }
      aside={
        <View style={recordFormStyles.card}>
          <Text style={recordFormStyles.label}>
            <Translated text={"Notes"} /></Text>

          <TextInput
            style={[styles.input, styles.notes]}
            multiline
            accessibilityLabel="Notes"
            value={notes}
            onChangeText={setNotes}
            placeholder="Optional notes..."
            placeholderTextColor="#94A3B8"
          />
        </View>
      }
      actions={
        <Pressable
          accessibilityRole="button"
          disabled={loading || (Platform.OS === "android" && (!Number.isFinite(Number(amount)) || Number(amount) <= 0))}
          style={({ pressed }) => [
            styles.button,
            loading && styles.buttonDisabled,
            pressed &&
              !loading &&
              styles.buttonPressed,
          ]}
          onPress={handleSubmit}
        >
          <Text style={styles.buttonText}>
            {loading ? <Translated text={"Saving..."} /> : t(submitLabel)}
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

  row: {
    flexDirection: "row",
    gap: 10,
  },

  choice: {
    flex: 1,
    minHeight: 46,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },

  choiceActive: {
    backgroundColor: "#DCE6FF",
    borderColor: "#4A6FE3",
  },

  choicePressed: {
    transform: [{ scale: 0.98 }],
  },

  choiceText: {
    textAlign: "center",
    fontSize: 14,
    fontWeight: "600",
    color: "#475569",
  },

  choiceTextActive: {
    color: "#3559C7",
    fontWeight: "700",
  },

  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 15,
    backgroundColor: "#F8FAFC",
    color: "#111827",
  },

  notes: {
    minHeight: 110,
    paddingTop: 14,
    textAlignVertical: "top",
  },

  button: {
    minHeight: 52,
    padding: 12,
    borderRadius: 13,
    backgroundColor: "#4A6FE3",
    alignItems: "center",
    justifyContent: "center",
  },

  buttonPressed: {
    backgroundColor: "#3559C7",
    transform: [{ scale: 0.985 }],
  },

  buttonDisabled: {
    opacity: 0.55,
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
});