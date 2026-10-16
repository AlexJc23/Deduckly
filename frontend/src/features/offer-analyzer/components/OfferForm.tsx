import { useLanguage, Translated } from "@/i18n/language";
import { View, Text, TextInput, Pressable } from "@/theme/components";
import { useState } from "react";
import { Platform, StyleSheet } from "react-native";
import { Ionicons } from "@/theme/icons";
import { OfferInput } from "../types/offer.types";
import { useFuelPriceEditor } from "@/features/vehicles/use-fuel-price-editor";
import type { FuelType } from "@/features/vehicles/types";
import { useIsTablet } from "@/hooks/use-is-tablet";

type OfferFormProps = {
  onAnalyze: (offer: OfferInput, price: number | null, manual: boolean) => void;
  collapsed?: boolean;
  onEdit?: () => void;
  onDraftChange?: () => void;
  initialFuelPrice?: string;
  fuelType?: FuelType;
  priceScope?: string;
  onSavePrice?: (value: string) => Promise<unknown>;
};

export function OfferForm({
  onAnalyze, collapsed = false, onEdit, onDraftChange, initialFuelPrice = "", fuelType = "gasoline", priceScope = "", onSavePrice,
}: OfferFormProps) {
  const { t } = useLanguage();
  const isTablet = useIsTablet();
  const styles = getStyles(isTablet);

  const [payout, setPayout] = useState("");
  const [distance, setDistance] = useState("");
  const price = useFuelPriceEditor(initialFuelPrice, priceScope, onSavePrice);
  const priceLabel = fuelType === "electric" ? "Current Electricity Price (optional)" : "Current Gas Price (optional)";
  const [estimatedTime, setEstimatedTime] =
    useState("");

  const isAnalyzeDisabled =
    !payout || !distance ||
      (!Number.isFinite(Number(payout)) || Number(payout) <= 0 ||
       !Number.isFinite(Number(distance)) || Number(distance) <= 0 ||
       !Number.isFinite(Number(estimatedTime)) || Number(estimatedTime) < 0 ||
       !price.parsed.valid);

  function handleAnalyze() {
    if (isAnalyzeDisabled) return;
    const offer: OfferInput = {
      payout: Number(payout),
      distance: Number(distance),
      estimatedTime: Number(estimatedTime),
      additionalMiles: 0,
    };

    price.commit();
    onAnalyze(offer, price.parsed.price, price.dirty);
  }

  if (collapsed) return <View style={styles.container}>
    <Text accessibilityRole="header" style={styles.title}>{t('Analyzed offer')}</Text>
    <Text style={styles.label}>${Number(payout).toFixed(2)} · {distance} {t('miles')}{Number(estimatedTime)>0 ? ` · ${estimatedTime} ${t('minutes')}` : ''}</Text>
    <Pressable accessibilityRole="button" accessibilityState={{ expanded: false }} onPress={onEdit} style={{minHeight:44,justifyContent:'center'}}><Text style={{color:'#0072B5',fontWeight:'700'}}>{t('Edit Offer')}</Text></Pressable>
  </View>;

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
            <Translated text={"Offer Analyzer"} /></Text>

          <Text style={styles.subtitle}>
            <Translated text={"See what an offer is really worth."} /></Text>
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>
          <Translated text={"Offer Payout"} /></Text>

        <View style={styles.inputWrapper}>
          <TextInput
            placeholder="$18.50"
            placeholderTextColor="#94A3B8"
            keyboardType="decimal-pad"
            value={payout}
            onChangeText={value => { onDraftChange?.(); setPayout(Platform.OS === "android" ? value.replace(",", ".") : value); }}
            style={styles.input}
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>
          <Translated text={"Total Distance"} /></Text>

        <View style={styles.inputWrapper}>
          <TextInput
            placeholder="7.5 miles"
            placeholderTextColor="#94A3B8"
            keyboardType="decimal-pad"
            value={distance}
            onChangeText={value => { onDraftChange?.(); setDistance(Platform.OS === "android" ? value.replace(",", ".") : value); }}
            style={styles.input}
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>
          <Translated text={"Estimated Time (optional)"} /></Text>

        <View style={styles.inputWrapper}>
          <TextInput
            placeholder="25 minutes"
            placeholderTextColor="#94A3B8"
            keyboardType="number-pad"
            value={estimatedTime}
            onChangeText={value => { onDraftChange?.(); setEstimatedTime(Platform.OS === "android" ? value.replace(",", ".") : value); }}
            style={styles.input}
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}><Translated text={priceLabel} /></Text>
        <View style={[styles.inputWrapper, { flexDirection: 'row', alignItems: 'center' }]}>
          <Text style={{ paddingLeft: 14 }}>$</Text>
          <TextInput accessibilityLabel={t(priceLabel)} keyboardType="decimal-pad" value={price.value}
            onChangeText={value => { onDraftChange?.(); price.change(value); }} onBlur={price.commit} placeholder={fuelType === 'electric' ? '0.20' : '3.25'} style={styles.input} />
        </View>
        <Text style={styles.subtitle}><Translated text={fuelType === 'electric' ? 'USD / kWh' : 'USD / US gallon'} /></Text>
        {!price.parsed.valid && <Text accessibilityLiveRegion="polite"><Translated text="Enter a price from $0 to $100, or leave it blank." /></Text>}
        {price.error && <Text accessibilityLiveRegion="polite"><Translated text="Price could not be saved on this device." /></Text>}
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
          <Translated text={"Analyze Offer"} /></Text>

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