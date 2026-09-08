import { useLanguage, Translated } from "@/i18n/language";
import { View, Text, Pressable } from "@/theme/components";
import { ActivityIndicator, Linking } from 'react-native';
import { BackHeader } from '@/components/ui/BackButton'
import React from 'react'

import { useMileageRates } from '@/features/settings/hooks/use-mileage-rate'

export default function Mileage_rate() {
  const { locale } = useLanguage();
    const { data: mileageRates, isLoading } = useMileageRates()
    const currentRate = mileageRates?.[0]
    const IRS_MILEAGE_URL = "https://www.irs.gov/irb/2026-29_irb";
    function formatEffectiveDate(date: string): string {
        return new Date(date).toLocaleDateString(locale, {
            month: "long",
            day: "numeric",
            year: "numeric",
            timeZone: "UTC", // Prevents timezone shifts
        });
    }
    return (
        <View style={{}}>
            <BackHeader />
            <View>
                <Text><Translated text={"Current IRS Mileage Rate"} /></Text>

                {isLoading ? (
                    <ActivityIndicator />
                ) : (
                    <Text>{(currentRate?.business_rate * 100).toFixed(1)}<Translated text={"c / mile"} /></Text>
                )}
                {isLoading ? (
                    <ActivityIndicator />
                ) : (
                    <Text>{formatEffectiveDate(currentRate?.effective_date)}</Text>
                )}
                <Text>
                    <Translated text={"Used to calculate your business mileage deduction."} /></Text>

            </View>

            <View>
                <Text>
                    <Translated text={"ⓘ About the Mileage Rate"} /></Text>
                <Text>
                    <Translated text={"The IRS standard mileage rate is used to calculate your deduction for business driving. It includes costs such as gas, maintenance, depreciation, insurance, and repairs. If you use the Standard Mileage method, these vehicle expenses generally cannot be deducted separately."} /></Text>
                <Pressable
                    onPress={() =>
                        Linking.openURL(
                        IRS_MILEAGE_URL
                        )
                    }
                    >
                    <Text style={{ color: "#2563EB" }}>
                        <Translated text={"View IRS Mileage Rates ↗"} /></Text>
                </Pressable>
            </View>
            <View>
                <Text><Translated text={"Previous Rates"} /></Text>
                <View>
                    {isLoading ? (
                        <ActivityIndicator />
                    ) : (
                        mileageRates?.map(
                            (rate: { id: string; effective_date: string; business_rate: number }) => (
                                <View key={rate.id}>
                                    <Text>{formatEffectiveDate(rate.effective_date)}</Text>
                                    <Text>{(rate.business_rate * 100).toFixed(1)}<Translated text={"c / mile"} /></Text>
                                </View>
                            )
                        )
                    )}
                </View>
            </View>

        </View>
    )
}