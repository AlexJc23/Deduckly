import { View, ScrollView } from "@/theme/components";
import { useState } from "react";
import { Keyboard, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, StyleSheet } from "react-native";

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
import { useIsTablet } from "@/hooks/use-is-tablet";

export default function OfferAnalyzerScreen() {
  const isTablet = useIsTablet();
  const styles = getStyles(isTablet);

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

      <ScrollView
        contentContainerStyle={
          styles.scrollContent
        }
        showsVerticalScrollIndicator={false}
      >
        <TouchableWithoutFeedback
          onPress={Keyboard.dismiss}
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
              <View style={styles.premiumContainer}>
                <PremiumButton
                  title="See beyond the payout."
                  message="Know what an offer could mean for your bottom line before you take it."
                  features={[
                    "Estimated profit after vehicle costs",
                    "See what your time could earn per hour",
                    "Recommendations based on your preferences",
                  ]}
                />
              </View>
            )}
          </View>
        </TouchableWithoutFeedback>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const getStyles = (isTablet: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#FFFFFF",
    },

    scrollContent: {
      flexGrow: 1,
      paddingBottom: isTablet ? 50 : 30,
    },

    content: {
      flex: 1,
      width: "100%",
      maxWidth: isTablet ? 1000 : undefined,
      alignSelf: isTablet ? "center" : undefined,

      paddingHorizontal: isTablet ? 34 : 16,
      paddingTop: isTablet ? 18 : 8,
      gap: isTablet ? 18 : 10,
    },

    premiumContainer: {
      width: "100%",
      maxWidth: isTablet ? 900 : undefined,
      alignSelf: isTablet ? "center" : undefined,
      marginTop: isTablet ? 2 : 0,
      marginBottom: isTablet ? 20 : 10,
    },
  });