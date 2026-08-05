import { useState } from "react";
import {
  View,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  StyleSheet,
  ScrollView,
} from "react-native";

import { BackHeader } from "@/components/ui/BackButton";
import PremiumButton from "@/components/ui/PremiumButton";

import { OfferForm } from "@/features/offer-analyzer/components/OfferForm";
import { OfferResultCard } from "@/features/offer-analyzer/components/OfferResultCard";

import {
  OfferInput,
  OfferResult,
  PremiumOfferResult,
} from "@/features/offer-analyzer/types/offer.types";

import { analyzeOffer } from "@/features/offer-analyzer/utils/verdict";
import { analyzePremiumOffer } from "@/features/offer-analyzer/utils/premium";

import { usePreferences } from "@/features/settings/hooks/usePreferences";
import { usePremium } from "@/features/subscriptions/hooks/use-premium";

export default function OfferAnalyzerScreen() {
  const [result, setResult] = useState<
    OfferResult | PremiumOfferResult | null
  >(null);

  const { preferences } = usePreferences();

  // TODO: Replace with RevenueCat
  const { isPremium } = usePremium();

  function handleAnalyze(
    offer: OfferInput,
  ) {
    Keyboard.dismiss();

    if (isPremium) {
      if (!preferences) {
        return;
      }

      const premiumResult =
        analyzePremiumOffer(
          offer,
          {
            costPerMile: Number(
              preferences.costPerMile,
            ),
            minimumProfit: Number(
              preferences.minimumProfit,
            ),
            minimumHourRate: Number(
              preferences.minimumHourlyRate,
            ),
            minimumDollarsPerMile:
              Number(
                preferences.minimumDollarsPerMile,
              ),
            preferredMaxDistance:
              Number(
                preferences.preferredMaxDistance,
              ),
          },
        );

      setResult(
        premiumResult,
      );
      return;
    }

    const freeResult =
      analyzeOffer(offer);

    setResult(freeResult);
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

      <ScrollView>
        <TouchableWithoutFeedback
          onPress={
            Keyboard.dismiss
          }
        >
          <View
            style={styles.content}
          >
            <OfferForm
              onAnalyze={
                handleAnalyze
              }
            />

            {result && (
              <OfferResultCard
                result={result}
              />
            )}

            {!isPremium && (
            <PremiumButton
              title="Unlock Deduckly Pro"
              message="See personalized profit estimates, hourly earnings, vehicle costs, and smart recommendations tailored to your preferences."
              features={[
                "✓ Personalized Offer Analysis",
                "✓ Profit After Vehicle Costs",
                "✓ Hourly Earnings",
                "✓ Custom Acceptance Rules",
                "✓ Smart Recommendations",
              ]}
            />
          )}
          </View>
        </TouchableWithoutFeedback>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles =
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor:
        "#FFFFFF",
    },

    content: {
      flex: 1,
      paddingHorizontal: 16,
      paddingTop: 8,
      gap: 10,
    },
  });