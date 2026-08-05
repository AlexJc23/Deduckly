import {
  View,
  Text,
  ActivityIndicator,
  Linking,
  Pressable,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { BackHeader } from '@/components/ui/BackButton'
import React from 'react'

import { useMileageRates } from '@/features/settings/hooks/use-mileage-rate'

export default function Mileage_rate() {
    const { data: mileageRates, isLoading } = useMileageRates()
    const currentRate = mileageRates?.[0]
    const IRS_MILEAGE_URL = "https://www.irs.gov/irb/2026-29_irb";
    function formatEffectiveDate(date: string): string {
        return new Date(date).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
            timeZone: "UTC", // Prevents timezone shifts
        });
    }
    return (
  <View style={styles.container}>
    <BackHeader />

    <ScrollView
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.currentCard}>
        <Text style={styles.heading}>Current IRS Mileage Rate</Text>

        {isLoading ? (
          <ActivityIndicator size="large" color="#2DBE60" />
        ) : (
          <Text style={styles.currentRate}>
            {(currentRate?.business_rate * 100).toFixed(1)}¢ / mile
          </Text>
        )}

        {isLoading ? (
          <ActivityIndicator color="#2DBE60" />
        ) : (
          <Text style={styles.date}>
            Effective {formatEffectiveDate(currentRate?.effective_date)}
          </Text>
        )}

        <Text style={styles.subtitle}>
          Used to calculate your business mileage deduction.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>
          About the Mileage Rate
        </Text>

        <Text style={styles.body}>
          The IRS standard mileage rate is used to calculate your deduction for
          business driving. It includes costs such as gas, maintenance,
          depreciation, insurance, and repairs.
        </Text>

        <Text style={styles.body}>
          If you use the Standard Mileage method, these vehicle expenses
          generally cannot be deducted separately.
        </Text>

        <Pressable
          style={styles.linkButton}
          onPress={() => Linking.openURL(IRS_MILEAGE_URL)}
        >
          <Text style={styles.link}>
            View IRS Mileage Rates ↗
          </Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>
          Previous Rates
        </Text>

        {isLoading ? (
          <ActivityIndicator color="#2DBE60" />
        ) : (
          mileageRates?.map(
            (rate: {
              id: string;
              effective_date: string;
              business_rate: number;
            }) => (
              <View
                key={rate.id}
                style={styles.rateRow}
              >
                <Text style={styles.rateDate}>
                  {formatEffectiveDate(rate.effective_date)}
                </Text>

                <Text style={styles.rateAmount}>
                  {(rate.business_rate * 100).toFixed(1)}¢ / mile
                </Text>
              </View>
            )
          )
        )}
      </View>
    </ScrollView>
  </View>
);
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F8FA",
  },

  content: {
    padding: 20,
    gap: 20,
  },

  currentCard: {
    backgroundColor: "#2DBE60",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",

    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 3,
    },

    elevation: 4,
  },

  heading: {
    color: "#EAFBF0",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },

  currentRate: {
    fontSize: 42,
    fontWeight: "700",
    color: "#FFF",
  },

  date: {
    marginTop: 8,
    color: "#F3FFF7",
    fontSize: 15,
  },

  subtitle: {
    marginTop: 18,
    textAlign: "center",
    color: "#F8FFF9",
    lineHeight: 22,
    fontSize: 15,
  },

  card: {
    backgroundColor: "#FFF",
    borderRadius: 18,
    padding: 20,

    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 2,
    },

    elevation: 2,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 16,
  },

  body: {
    fontSize: 15,
    color: "#4B5563",
    lineHeight: 24,
    marginBottom: 16,
  },

  linkButton: {
    alignSelf: "flex-start",
  },

  link: {
    color: "#2563EB",
    fontSize: 15,
    fontWeight: "600",
  },

  rateRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },

  rateDate: {
    fontSize: 15,
    color: "#374151",
  },

  rateAmount: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2DBE60",
  },
});