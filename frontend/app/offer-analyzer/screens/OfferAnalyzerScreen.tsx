import { NAVY } from '@/theme/palette';
import { subscribeAccountBoundary, getAccountGeneration } from "@/features/auth/services/account-boundary";
import { savePrice } from "@/features/vehicles/store";
import { withFuelPrice } from "@/features/vehicles/fuel-price-input";
import { useFuelAssumptions } from "@/features/vehicles/use-fuel-assumptions";
import { analyzeIntegratedOffer } from "@/features/offer-analyzer/utils/integrated";
import { useAppTheme } from "@/theme/theme";
import { View, ScrollView } from "@/theme/components";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
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


import { usePreferences } from "@/features/settings/hooks/usePreferences";
import { usePremium } from "@/features/subscriptions/hooks/use-premium";
import { useIsTablet } from "@/hooks/use-is-tablet";

export default function OfferAnalyzerScreen() {
  const generation = useSyncExternalStore(subscribeAccountBoundary, getAccountGeneration, getAccountGeneration);
  return <AccountOfferAnalyzer key={generation} />;
}
function AccountOfferAnalyzer() {
  const isTablet = useIsTablet();
  const { dark } = useAppTheme();
  const styles = getStyles(isTablet);

  const fuelState = useFuelAssumptions();
  const { assumptions } = fuelState;
  const fuelType = assumptions?.fuelType ?? 'gasoline';
  const priceGeneration = getAccountGeneration();
  const savedPrice = fuelState.data?.prices[fuelType];
  const initialPrice = savedPrice?.trim() ? savedPrice : (assumptions?.price == null ? '' : String(assumptions.price));
  const [result, setResult] = useState<
    OfferResult | PremiumOfferResult | null
  >(null);

  const scroll = useRef<ScrollView>(null);
  useEffect(() => {
    if (!result) return;
    const frame = requestAnimationFrame(() => scroll.current?.scrollTo({ y: 0, animated: false }));
    return () => cancelAnimationFrame(frame);
  }, [result]);
  const { preferences } = usePreferences();

  const { isPremium } = usePremium();
  function handleAnalyze(
    offer: OfferInput, price: number | null, manual: boolean,
  ) {
    Keyboard.dismiss();
    const analysisAssumptions = withFuelPrice(assumptions, price, manual || price !== assumptions?.price);

    if (isPremium) {
      if (!preferences) {
        return;
      }

      const premiumResult =
        analyzeIntegratedOffer(
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
          analysisAssumptions,
        );

      setResult(
        premiumResult,
      );
      return;
    }

    const freeResult =
      analyzeIntegratedOffer(offer, null, analysisAssumptions);

    setResult(freeResult);
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, dark && styles.darkContainer]}
      behavior={
        Platform.OS === "ios"
          ? "padding"
          : undefined
      }
    >
      <BackHeader />

      <ScrollView ref={scroll}
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
              collapsed={!!result}
              onEdit={() => setResult(null)}
              onDraftChange={() => setResult(null)}
              initialFuelPrice={initialPrice}
              fuelType={fuelType}
              priceScope={`${priceGeneration}:${fuelState.owner ?? 'guest'}:${fuelType}`}
              onSavePrice={fuelState.owner ? value => {
                if (priceGeneration !== getAccountGeneration()) return Promise.reject(new Error('Account changed'));
                return savePrice(fuelState.owner!, fuelType, value);
              } : undefined}
              onAnalyze={
                handleAnalyze
              }
            />
            {result && <OfferResultCard result={result} />}

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

    darkContainer: {
      backgroundColor: NAVY.background,
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