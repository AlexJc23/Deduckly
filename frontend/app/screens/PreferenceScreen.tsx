import { useAppTheme, type AppearancePreference } from "@/theme/theme";
import { ScrollView, Pressable, Text, View } from "@/theme/components";
import { StyleSheet } from "react-native";
import { useState } from "react";

import { BackHeader } from "@/components/ui/BackButton";
import PremiumButton from "../../src/components/ui/PremiumButton";

import { PreferenceSection } from "../../src/features/settings/components/PreferenceSection";
import { PreferenceInput } from "../../src/features/settings/components/PreferenceInput";
import { PreferenceToggle } from "../../src/features/settings/components/PreferenceToggle";
import { PreferencePicker } from "../../src/features/settings/components/PreferencePicker";

import { usePreferences } from "../../src/features/settings/hooks/usePreferences";

import { PreferenceSelectedModal } from "../../src/features/settings/modals/PreferenceSelectedModal";

import { currencies } from "../../src/features/settings/constants/currencies";
import { distanceUnits } from "../../src/features/settings/constants/distance-units";
import { weekStarts } from "../../src/features/settings/constants/week-starts";

import { usePremium } from "@/features/subscriptions/hooks/use-premium";

export default function PreferenceScreen() {
    const { preference, setPreference } = useAppTheme();
    const [appearanceVisible, setAppearanceVisible] = useState(false);
    const {
        preferences,
        updateField,
        updateToggle,
        updateSelect,
        savePreferences,
        isSaving,
    } = usePreferences();

    const [currencyModalVisible, setCurrencyModalVisible] =
        useState(false);

    const [distanceUnitModalVisible, setDistanceUnitModalVisible] =
        useState(false);

    const [weekStartsModalVisible, setWeekStartsModalVisible] =
        useState(false);

    const { isPremium } = usePremium();

    return (
        <View style={styles.container}>
            <BackHeader />

            <ScrollView
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                <PreferenceSection title="Goals">
                    <PreferenceInput
                        label="Monthly Income Goal"
                        value={preferences.monthlyIncomeGoal}
                        keyboardType="numeric"
                        onChangeText={(text) =>
                            updateField(
                                "monthlyIncomeGoal",
                                text
                            )
                        }
                    />
                    <PreferenceInput
                        label="Daily Income Goal"
                        value={preferences.dailyIncomeGoal}
                        keyboardType="numeric"
                        onChangeText={(text) =>
                            updateField(
                                "dailyIncomeGoal",
                                text
                            )
                        }
                    />
                </PreferenceSection>

                <PreferenceSection title="Offer Analyzer">
                    {isPremium ? (
                        <>
                            <PreferenceInput
                                label="Minimum Hourly Rate"
                                value={preferences.minimumHourlyRate}
                                keyboardType="numeric"
                                onChangeText={(text) =>
                                    updateField(
                                        "minimumHourlyRate",
                                        text
                                    )
                                }
                            />

                            <PreferenceInput
                                label="Minimum Profit"
                                value={preferences.minimumProfit}
                                keyboardType="numeric"
                                onChangeText={(text) =>
                                    updateField(
                                        "minimumProfit",
                                        text
                                    )
                                }
                            />

                            <PreferenceInput
                                label="Minimum $ per Mile"
                                value={
                                    preferences.minimumDollarsPerMile
                                }
                                keyboardType="numeric"
                                onChangeText={(text) =>
                                    updateField(
                                        "minimumDollarsPerMile",
                                        text
                                    )
                                }
                            />

                            <PreferenceInput
                                label="Maximum Delivery Distance"
                                value={
                                    preferences.preferredMaxDistance
                                }
                                keyboardType="numeric"
                                onChangeText={(text) =>
                                    updateField(
                                        "preferredMaxDistance",
                                        text
                                    )
                                }
                            />
                        </>
                    ) : (
                        <>
                            <PreferenceInput
                                label="Minimum Hourly Rate"
                                value=""
                                editable={false}
                                placeholder="Premium"
                            />

                            <PreferenceInput
                                label="Minimum Profit"
                                value=""
                                editable={false}
                                placeholder="Premium"
                            />

                            <PreferenceInput
                                label="Minimum $ per Mile"
                                value=""
                                editable={false}
                                placeholder="Premium"
                            />

                            <PreferenceInput
                                label="Maximum Delivery Distance"
                                value=""
                                editable={false}
                                placeholder="Premium"
                            />

                            <View style={{ marginTop: 12 }}>
                                <PremiumButton
                                    title="Unlock Offer Analyzer"
                                    message="Customize your offer analyzer with your own business goals and receive smarter recommendations."
                                    features={[
                                        "Minimum Hourly Rate",
                                        "Minimum Profit",
                                        "Minimum $ per Mile",
                                        "Maximum Delivery Distance",
                                    ]}
                                    onPress={() =>
                                        // router.push("/paywall")
                                        {}
                                    }
                                />
                            </View>
                        </>
                    )}
                </PreferenceSection>

                <PreferenceSection title="Appearance">
                    <PreferencePicker label="Theme" value={preference === "system" ? "System" : preference === "dark" ? "Dark" : "Light"} helperText="Applies immediately on this device. System follows your device’s appearance." onPress={() => setAppearanceVisible(true)} />
                </PreferenceSection>

                <PreferenceSection title="Units">
                    <PreferencePicker
                        label="Distance Unit"
                        value="Miles"
                        onPress={() =>
                            setDistanceUnitModalVisible(true)
                        }
                    />

                    <PreferencePicker
                        label="Currency"
                        value={preferences.currency}
                        onPress={() =>
                            setCurrencyModalVisible(true)
                        }
                    />

                    <PreferencePicker
                        label="Week Starts On"
                        value={preferences.weekStartsOn}
                        onPress={() =>
                            setWeekStartsModalVisible(true)
                        }
                    />
                </PreferenceSection>
                                <PreferenceSection title="Notifications">
                    <PreferenceToggle
                        label="Enable Notifications"
                        value={preferences.notificationsEnabled}
                        disabled={isSaving}
                        onValueChange={(value) => updateToggle("notificationsEnabled", value)}
                    />
                    <PreferenceToggle
                        label="Income Goal Reminders"
                        description="Daily at 8 AM, noon, and 4 PM, plus a new-month reminder on the first. Uses your local time."
                        value={preferences.goalRemindersEnabled}
                        disabled={isSaving || !preferences.notificationsEnabled}
                        onValueChange={(value) => updateToggle("goalRemindersEnabled", value)}
                    />
                </PreferenceSection>

                <Pressable
                    style={[
                        styles.saveButton,
                        isSaving &&
                            styles.saveButtonDisabled,
                    ]}
                    disabled={isSaving}
                    onPress={savePreferences}
                >
                    <Text style={styles.saveButtonText}>
                        {isSaving
                            ? "Saving..."
                            : "Save Changes"}
                    </Text>
                </Pressable>
            </ScrollView>

            <PreferenceSelectedModal visible={appearanceVisible} title="Appearance" options={[{ label: "System", value: "system" }, { label: "Light", value: "light" }, { label: "Dark", value: "dark" }]} selectedValue={preference} onClose={() => setAppearanceVisible(false)} onSelect={value => setPreference(value as AppearancePreference)} />

            <PreferenceSelectedModal
                visible={currencyModalVisible}
                title="Currency"
                options={currencies}
                selectedValue={preferences.currency}
                onClose={() =>
                    setCurrencyModalVisible(false)
                }
                onSelect={(value) => {
                    updateSelect(
                        "currency",
                        value
                    );
                    setCurrencyModalVisible(false);
                }}
            />

            <PreferenceSelectedModal
                visible={
                    distanceUnitModalVisible
                }
                title="Distance Unit"
                options={distanceUnits}
                selectedValue={
                    preferences.distanceUnit
                }
                onClose={() =>
                    setDistanceUnitModalVisible(
                        false
                    )
                }
                onSelect={(value) => {
                    updateSelect(
                        "distanceUnit",
                        value
                    );
                    setDistanceUnitModalVisible(
                        false
                    );
                }}
            />

            <PreferenceSelectedModal
                visible={
                    weekStartsModalVisible
                }
                title="Week Starts On"
                options={weekStarts}
                selectedValue={
                    preferences.weekStartsOn
                }
                onClose={() =>
                    setWeekStartsModalVisible(
                        false
                    )
                }
                onSelect={(value) => {
                    updateSelect(
                        "weekStartsOn",
                        value
                    );
                    setWeekStartsModalVisible(
                        false
                    );
                }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F8FAFC",
    },

    content: {
        width: "100%",
        maxWidth: 760,
        alignSelf: "center",
        padding: 20,
        paddingBottom: 40,
        gap: 20,
    },

    saveButton: {
        height: 56,
        borderRadius: 16,
        backgroundColor: "#2563EB",
        justifyContent: "center",
        alignItems: "center",
        marginTop: 8,
    },

    saveButtonDisabled: {
        opacity: 0.6,
    },

    saveButtonText: {
        color: "#FFF",
        fontSize: 16,
        fontWeight: "600",
    },
});