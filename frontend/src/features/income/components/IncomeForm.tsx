import { useEffect, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

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
      received_at: new Date().toISOString(),
    });

    router.back();
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.header}>
        <Text style={styles.eyebrow}>
          INCOME
        </Text>

        <Text style={styles.title}>
          Add income
        </Text>

        <Text style={styles.subtitle}>
          Keep your earnings organized and ready
          for reporting.
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
            style={styles.amountInput}
            keyboardType="decimal-pad"
            value={amount}
            onChangeText={setAmount}
            placeholder="0.00"
            placeholderTextColor="#94A3B8"
          />
        </View>

        <Text style={styles.label}>
          Income Source
        </Text>

        <View style={styles.row}>
          <Pressable
            style={({ pressed }) => [
              styles.choice,
              source === "gig_platform" &&
                styles.choiceActive,
              pressed && styles.choicePressed,
            ]}
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
              Gig Platform
            </Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.choice,
              source === "business" &&
                styles.choiceActive,
              pressed && styles.choicePressed,
            ]}
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
              Business
            </Text>
          </Pressable>
        </View>

        {source === "gig_platform" && (
          <>
            <Text style={styles.label}>
              Platform
            </Text>

            <View style={styles.wrap}>
              {platforms.map((item) => {
                const selected =
                  platform === item;

                return (
                  <Pressable
                    key={item}
                    style={({ pressed }) => [
                      styles.platform,
                      selected &&
                        styles.platformActive,
                      pressed &&
                        styles.platformPressed,
                    ]}
                    onPress={() =>
                      setPlatform(item)
                    }
                  >
                    <Text
                      style={[
                        styles.platformText,
                        selected &&
                          styles.platformTextActive,
                      ]}
                    >
                      {item.replaceAll("_", " ")}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </>
        )}

        {source === "business" && (
          <>
            <Text style={styles.label}>
              Business Name
            </Text>

            <TextInput
              style={styles.input}
              value={businessName}
              onChangeText={setBusinessName}
              placeholder="Business Name"
              placeholderTextColor="#94A3B8"
            />
          </>
        )}

        <Text style={styles.label}>
          Notes
        </Text>

        <TextInput
          style={[styles.input, styles.notes]}
          multiline
          value={notes}
          onChangeText={setNotes}
          placeholder="Optional notes..."
          placeholderTextColor="#94A3B8"
        />

        <Pressable
          disabled={loading}
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
            {loading ? "Saving..." : submitLabel}
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  content: {
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
  },

  choiceActive: {
    backgroundColor: "#DCE6FF",
    borderColor: "#4A6FE3",
  },

  choicePressed: {
    transform: [{ scale: 0.98 }],
  },

  choiceText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#475569",
  },

  choiceTextActive: {
    color: "#3559C7",
    fontWeight: "700",
  },

  wrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  platform: {
    paddingHorizontal: 13,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
  },

  platformActive: {
    backgroundColor: "#DCE6FF",
    borderColor: "#4A6FE3",
  },

  platformPressed: {
    transform: [{ scale: 0.97 }],
  },

  platformText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#475569",
    textTransform: "capitalize",
  },

  platformTextActive: {
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
    height: 110,
    paddingTop: 14,
    textAlignVertical: "top",
  },

  button: {
    minHeight: 52,
    marginTop: 24,
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