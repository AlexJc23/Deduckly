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
  const [businessName, setBusinessName] =
    useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!initialValues) return;

    setAmount(initialValues.amount?.toString() ?? "");
    setSource(initialValues.source ?? "gig_platform");
    setPlatform(initialValues.platform ?? "doordash");
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
      contentContainerStyle={styles.container}
    >
      <Text style={styles.label}>
        Amount
      </Text>

      <TextInput
        style={styles.input}
        keyboardType="decimal-pad"
        value={amount}
        onChangeText={setAmount}
        placeholder="0.00"
      />

      <Text style={styles.label}>
        Income Source
      </Text>

      <View style={styles.row}>
        <Pressable
          style={[
            styles.choice,
            source === "gig_platform" &&
              styles.choiceActive,
          ]}
          onPress={() =>
            setSource("gig_platform")
          }
        >
          <Text>Gig</Text>
        </Pressable>

        <Pressable
          style={[
            styles.choice,
            source === "business" &&
              styles.choiceActive,
          ]}
          onPress={() =>
            setSource("business")
          }
        >
          <Text>Business</Text>
        </Pressable>
      </View>

      {source === "gig_platform" && (
        <>
          <Text style={styles.label}>
            Platform
          </Text>

          <View style={styles.wrap}>
            {platforms.map((item) => (
              <Pressable
                key={item}
                style={[
                  styles.platform,
                  platform === item &&
                    styles.platformActive,
                ]}
                onPress={() =>
                  setPlatform(item)
                }
              >
                <Text>
                  {item.replaceAll("_", " ")}
                </Text>
              </Pressable>
            ))}
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
      />

      <Pressable
        disabled={loading}
        style={styles.button}
        onPress={handleSubmit}
      >
        <Text style={styles.buttonText}>
          {submitLabel}
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 60,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    backgroundColor: "#FFF",
  },
  notes: {
    height: 120,
    textAlignVertical: "top",
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  choice: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
  },
  choiceActive: {
    backgroundColor: "#111827",
    borderColor: "#111827",
  },
  wrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  platform: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  platformActive: {
    backgroundColor: "#111827",
    borderColor: "#111827",
  },
  button: {
    marginTop: 32,
    backgroundColor: "#111827",
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
  },
  buttonText: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 16,
  },
});