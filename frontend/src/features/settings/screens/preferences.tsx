import { ScrollView, StyleSheet, View, Pressable, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { PreferenceSection } from "../../src/features/settings/components/PreferenceSection";
import { PreferenceInput } from "../../src/features/settings/components/PreferenceInput";
import { PreferenceToggle } from "../../src/features/settings/components/PreferenceToggle";
import { PreferencePicker } from "../../src/features/settings/components/PreferencePicker";
import { usePreferences } from "../../src/features/settings/hooks/usePreferences";
import { useState } from "react";

import { PreferenceSelectedModal } from "../../src/features/settings/modals/PreferenceSelectedModal";

import { currencies } from "../../src/features/settings/constants/currencies";
import { distanceUnits } from "../../src/features/settings/constants/distance-units";
import { weekStarts } from "../../src/features/settings/constants/week-starts";

export default function PreferenceScreen() {
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

    return (
        <SafeAreaView style={styles.container}>
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
                            updateField("monthlyIncomeGoal", text)
                        }
                    />

                    <PreferenceInput
                        label="Weekly Income Goal"
                        value={preferences.weeklyIncomeGoal}
                        keyboardType="numeric"
                        onChangeText={(text) =>
                            updateField("weeklyIncomeGoal", text)
                        }
                    />
                </PreferenceSection>

                <PreferenceSection title="Offer Analyzer">
                    <PreferenceInput
                        label="Minimum Hourly Rate"
                        value={preferences.minimumHourlyRate}
                        keyboardType="numeric"
                        onChangeText={(text) =>
                            updateField("minimumHourlyRate", text)
                        }
                    />

                    <PreferenceInput
                        label="Minimum Profit"
                        value={preferences.minimumProfit}
                        keyboardType="numeric"
                        onChangeText={(text) =>
                            updateField("minimumProfit", text)
                        }
                    />

                    <PreferenceInput
                        label="Minimum Dollars Per Mile"
                        value={preferences.minimumDollarsPerMile}
                        keyboardType="numeric"
                        onChangeText={(text) =>
                            updateField("minimumDollarsPerMile", text)
                        }
                    />

                    <PreferenceInput
                        label="Vehicle Cost Per Mile"
                        value={preferences.costPerMile}
                        keyboardType="numeric"
                        onChangeText={(text) =>
                            updateField("costPerMile", text)
                        }
                    />

                    <PreferenceInput
                        label="Preferred Max Distance"
                        value={preferences.preferredMaxDistance}
                        keyboardType="numeric"
                        onChangeText={(text) =>
                            updateField("preferredMaxDistance", text)
                        }
                    />
                </PreferenceSection>

                <PreferenceSection title="Units">
                    <PreferencePicker
                        label="Currency"
                        value={preferences.currency}
                        onPress={() => setCurrencyModalVisible(true)}
                    />

                    <PreferencePicker
                        label="Distance Unit"
                        value={preferences.distanceUnit}
                        onPress={() => setDistanceUnitModalVisible(true)}
                    />

                    <PreferencePicker
                        label="Week Starts On"
                        value={preferences.weekStartsOn}
                        onPress={() => setWeekStartsModalVisible(true)}
                    />
                </PreferenceSection>

                <PreferenceSection title="Notifications">
                    <PreferenceToggle
                        label="Notifications"
                        value={preferences.notificationsEnabled}
                        onValueChange={(value) =>
                            updateToggle("notificationsEnabled", value)
                        }
                    />

                    <PreferenceToggle
                        label="Trip Reminders"
                        value={preferences.tripRemindersEnabled}
                        onValueChange={(value) =>
                            updateToggle("tripRemindersEnabled", value)
                        }
                    />

                    <PreferenceToggle
                        label="Goal Reminders"
                        value={preferences.goalRemindersEnabled}
                        onValueChange={(value) =>
                            updateToggle("goalRemindersEnabled", value)
                        }
                    />
                </PreferenceSection>

                <PreferenceSection title="Tracking">
                    <PreferenceToggle
                        label="Automatic Trip Detection"
                        value={preferences.autoTripDetection}
                        onValueChange={(value) =>
                            updateToggle("autoTripDetection", value)
                        }
                    />
                </PreferenceSection>

                <Pressable
                    style={[
                        styles.saveButton,
                        isSaving && styles.saveButtonDisabled,
                    ]}
                    disabled={isSaving}
                    onPress={savePreferences}
                >
                    <Text style={styles.saveButtonText}>
                        {isSaving ? "Saving..." : "Save Changes"}
                    </Text>
                </Pressable>
            </ScrollView>
            <PreferenceSelectedModal
                visible={currencyModalVisible}
                title="Currency"
                options={currencies}
                selectedValue={preferences.currency}
                onClose={() => setCurrencyModalVisible(false)}
                onSelect={(value) => {
                    updateSelect("currency", value);
                    setCurrencyModalVisible(false);
                }}
            />
            <PreferenceSelectedModal
                visible={distanceUnitModalVisible}
                title="Distance Unit"
                options={distanceUnits}
                selectedValue={preferences.distanceUnit}
                onClose={() => setDistanceUnitModalVisible(false)}
                onSelect={(value) => {
                    updateSelect("distanceUnit", value);
                    setDistanceUnitModalVisible(false);
                }}
            />

            <PreferenceSelectedModal
                visible={weekStartsModalVisible}
                title="Week Starts On"
                options={weekStarts}
                selectedValue={preferences.weekStartsOn}
                onClose={() => setWeekStartsModalVisible(false)}
                onSelect={(value) => {
                    updateSelect("weekStartsOn", value);
                    setWeekStartsModalVisible(false);
                }}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F8FAFC",
    },

    content: {
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