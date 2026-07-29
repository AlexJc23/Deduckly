import { useState } from "react";
import {
  View,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  StyleSheet,
} from "react-native";

import { OfferForm } from "../../../src/features/offer-analyzer/components/OfferForm";
import { OfferResultCard } from "../../../src/features/offer-analyzer/components/OfferResultCard";
import { OfferInput, OfferResult } from "../../../src/features/offer-analyzer/types/offer.types";
import { analyzeOffer } from "../../../src/features/offer-analyzer/utils/verdict";

import { BackHeader } from "@/components/ui/BackButton";
import PremiumButton from "@/components/ui/PremiumButton";

export default function OfferAnalyzerScreen() {
  const [result, setResult] =
    useState<OfferResult | null>(null);

  function handleAnalyze(
    offer: OfferInput
  ) {
    Keyboard.dismiss();
    setResult(analyzeOffer(offer));
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={
        Platform.OS === "ios"
          ? "padding"
          : undefined
      }
    >
        <BackHeader />
      <TouchableWithoutFeedback
        onPress={Keyboard.dismiss}
      >
        <View style={styles.content}>

          <OfferForm
            onAnalyze={handleAnalyze}
          />

          {result && (
            <OfferResultCard
              result={result}
            />
          )}

          <PremiumButton
            title="Get Personalized Insights"
            message="Upgrade to Pro to use your own preferences and unlock profit estimates, breakdowns, and more."
          />
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 10,
  },
});