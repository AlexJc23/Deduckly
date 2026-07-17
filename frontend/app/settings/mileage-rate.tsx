import { View, Text, ActivityIndicator, Linking, Pressable } from 'react-native'
import React from 'react'

import { useMileageRates } from '@/features/settings/hooks/use-mileage-rate'

export default function Mileage_rate() {
    const { data: mileageRates, isLoading } = useMileageRates()
    const currentRate = mileageRates?.[0]

    function formatEffectiveDate(date: string): string {
        return new Date(date).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
            timeZone: "UTC", // Prevents timezone shifts
        });
    }
    return (
        <View style={{ marginTop: 60 }}>
            <View>
                <Text>Current IRS Mileage Rate</Text>

                {isLoading ? (
                    <ActivityIndicator />
                ) : (
                    <Text>{currentRate?.business_rate ?? <ActivityIndicator />}</Text>
                )}
                {isLoading ? (
                    <ActivityIndicator />
                ) : (
                    <Text>{formatEffectiveDate(currentRate?.effective_date) ?? <ActivityIndicator />}</Text>
                )}
                <Text>
                    Used to calculate your business mileage deduction.
                </Text>

            </View>

            <View>
                <Text>
                    ⓘ About the Mileage Rate
                </Text>
                <Text>
                    The IRS standard mileage rate is used
                    to calculate your deduction for
                    business driving. It includes costs
                    such as gas, maintenance,
                    depreciation, insurance, and repairs.

                    If you use the Standard Mileage
                    method, these vehicle expenses
                    generally cannot be deducted
                    separately.
                </Text>
                <Pressable
                    onPress={() =>
                        Linking.openURL(
                        "https://www.irs.gov/irb/2026-29_irb"
                        )
                    }
                    >
                    <Text style={{ color: "#2563EB" }}>
                        View IRS Mileage Rates ↗
                    </Text>
                </Pressable>
            </View>
            <View>
                <Text>Previous Rates</Text>
                <View>
                    {isLoading ? (
                        <ActivityIndicator />
                    ) : (
                        mileageRates?.map((rate: { id: string; effective_date: string; business_rate: number }) => (
                            <View key={rate.id}>
                                <Text>{formatEffectiveDate(rate.effective_date)}</Text>
                                <Text>{(rate.business_rate * 100).toFixed(1)}¢ / mile</Text>
                            </View>
                        ))
                    )}
                </View>
            </View>

        </View>
    )
}