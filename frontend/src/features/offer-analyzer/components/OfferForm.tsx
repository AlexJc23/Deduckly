import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { OfferInput } from "../types/offer.types";
import { useIsTablet } from "@/hooks/use-is-tablet";

type OfferFormProps = {
  onAnalyze: (offer: OfferInput) => void;
};

export function OfferForm({
  onAnalyze,
}: OfferFormProps) {
  const isTablet = useIsTablet();
  const styles = getStyles(isTablet);

  const [payout, setPayout] = useState("");
  const [distance, setDistance] = useState("");
  const [estimatedTime, setEstimatedTime] =
    useState("");

  const isAnalyzeDisabled =
    !payout || !distance;

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
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Ionicons
            name="analytics-outline"
            size={isTablet ? 25 : 20}
            color="#4A6FE3"
          />
        </View>

        <View style={styles.headerText}>
          <Text style={styles.title}>
            Offer Analyzer
          </Text>

          <Text style={styles.subtitle}>
            See what an offer is really worth.
          </Text>
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>
          Offer Payout
        </Text>

        <View style={styles.inputWrapper}>
          <TextInput
            placeholder="$18.50"
            placeholderTextColor="#94A3B8"
            keyboardType="decimal-pad"
            value={payout}
            onChangeText={setPayout}
            style={styles.input}
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>
          Total Distance
        </Text>

        <View style={styles.inputWrapper}>
          <TextInput
            placeholder="7.5 miles"
            placeholderTextColor="#94A3B8"
            keyboardType="decimal-pad"
            value={distance}
            onChangeText={setDistance}
            style={styles.input}
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>
          Estimated Time
        </Text>

        <View style={styles.inputWrapper}>
          <TextInput
            placeholder="25 minutes"
            placeholderTextColor="#94A3B8"
            keyboardType="number-pad"
            value={estimatedTime}
            onChangeText={setEstimatedTime}
            style={styles.input}
          />
        </View>
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.button,
          isAnalyzeDisabled &&
            styles.buttonDisabled,
          pressed &&
            !isAnalyzeDisabled &&
            styles.buttonPressed,
        ]}
        onPress={handleAnalyze}
        disabled={isAnalyzeDisabled}
      >
        <Text
          style={[
            styles.buttonText,
            isAnalyzeDisabled &&
              styles.buttonTextDisabled,
          ]}
        >
          Analyze Offer
        </Text>

        {!isAnalyzeDisabled && (
          <Ionicons
            name="arrow-forward"
            size={isTablet ? 21 : 18}
            color="#FFFFFF"
          />
        )}
      </Pressable>
    </View>
  );
}

const getStyles = (isTablet: boolean) =>
  StyleSheet.create({
    container: {
      backgroundColor: "#FFFFFF",
      borderRadius: isTablet ? 22 : 18,
      padding: isTablet ? 26 : 18,
      gap: isTablet ? 18 : 14,
      borderWidth: 1,
      borderColor: "#E5E7EB",

      shadowColor: "#111827",
      shadowOpacity: 0.04,
      shadowRadius: 10,
      shadowOffset: {
        width: 0,
        height: 3,
      },

      elevation: 2,
      marginTop: isTablet ? 16 : 10,

      width: "100%",
      maxWidth: isTablet ? 900 : undefined,
      alignSelf: isTablet ? "center" : undefined,
    },

    header: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: isTablet ? 6 : 4,
    },

    iconContainer: {
      width: isTablet ? 52 : 42,
      height: isTablet ? 52 : 42,
      borderRadius: isTablet ? 15 : 12,
      backgroundColor: "#DCE6FF",
      alignItems: "center",
      justifyContent: "center",
      marginRight: isTablet ? 15 : 12,
    },

    headerText: {
      flex: 1,
    },

    title: {
      fontSize: isTablet ? 24 : 20,
      fontWeight: "800",
      color: "#111827",
      letterSpacing: -0.4,
    },

    subtitle: {
      marginTop: isTablet ? 4 : 2,
      fontSize: isTablet ? 14 : 12,
      color: "#64748B",
    },

    inputGroup: {
      gap: isTablet ? 8 : 6,
    },

    label: {
      fontSize: isTablet ? 14 : 12,
      fontWeight: "700",
      color: "#334155",
    },

    inputWrapper: {
      height: isTablet ? 58 : 48,
      backgroundColor: "#F8FAFC",
      borderRadius: isTablet ? 14 : 12,
      borderWidth: 1,
      borderColor: "#E5E7EB",
    },

    input: {
      flex: 1,
      paddingHorizontal: isTablet ? 17 : 14,
      fontSize: isTablet ? 17 : 15,
      fontWeight: "600",
      color: "#111827",
    },

    button: {
      height: isTablet ? 62 : 50,
      borderRadius: isTablet ? 16 : 13,
      backgroundColor: "#4A6FE3",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: isTablet ? 9 : 8,
      marginTop: isTablet ? 6 : 4,

      shadowColor: "#4A6FE3",
      shadowOpacity: 0.18,
      shadowRadius: 8,
      shadowOffset: {
        width: 0,
        height: 4,
      },

      elevation: 3,
    },

    buttonPressed: {
      backgroundColor: "#3559C7",
      transform: [{ scale: 0.985 }],
    },

    buttonDisabled: {
      backgroundColor: "#E2E8F0",
      shadowOpacity: 0,
      elevation: 0,
    },

    buttonText: {
      color: "#FFFFFF",
      fontSize: isTablet ? 17 : 15,
      fontWeight: "700",
    },

    buttonTextDisabled: {
      color: "#94A3B8",
    },
  });