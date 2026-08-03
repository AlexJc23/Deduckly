import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
} from "react-native";
import { OfferInput } from "../types/offer.types";

type OfferFormProps = {
  onAnalyze: (offer: OfferInput) => void;
};

export function OfferForm({
  onAnalyze,
}: OfferFormProps) {
  const [payout, setPayout] = useState("");
  const [distance, setDistance] = useState("");
  const [estimatedTime, setEstimatedTime] =
    useState("");

  const isAnalyzeDisabled = !payout || !distance;

  function handleAnalyze() {
    const offer: OfferInput = {
      payout: Number(payout),
      distance: Number(distance),
      estimatedTime: Number(estimatedTime),
    };

    onAnalyze(offer);
  }

  return (
    
    <View style={styles.container}>
      <Text style={styles.title}>
        Offer Analyzer
      </Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>
          Offer Payout
        </Text>

        <TextInput
          placeholder="$18.50"
          placeholderTextColor="#9CA3AF"
          keyboardType="decimal-pad"
          value={payout}
          onChangeText={setPayout}
          style={styles.input}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>
          Total Distance
        </Text>

        <TextInput
          placeholder="7.5 miles"
          placeholderTextColor="#9CA3AF"
          keyboardType="decimal-pad"
          value={distance}
          onChangeText={setDistance}
          style={styles.input}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>
          Estimated Time
        </Text>

        <TextInput
          placeholder="25 minutes"
          placeholderTextColor="#9CA3AF"
          keyboardType="number-pad"
          value={estimatedTime}
          onChangeText={setEstimatedTime}
          style={styles.input}
        />
      </View>

      <Pressable
        style={styles.button}
        onPress={handleAnalyze}
        disabled={isAnalyzeDisabled}
      >
        <Text style={styles.buttonText}>
          Analyze Offer
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: "#EEF2F6",
    gap: 14,

    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    elevation: 2,
    marginTop: 10,
  },

  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 4,
  },

  inputGroup: {
    gap: 6,
  },

  label: {
    fontSize: 13,
    fontWeight: "700",
    color: "#374151",
  },

  input: {
    height: 48,
    backgroundColor: "#FCFCFD",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E8EDF2",
    paddingHorizontal: 16,
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },

  button: {
    height: 48,
    borderRadius: 14,
    backgroundColor: "#2EAF4A",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 6,
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },
});