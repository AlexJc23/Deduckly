import { useEffect, useRef, useState } from "react";

import { Alert } from "react-native";
import { updateCurrentUser } from "@/features/auth/api/user.api";
import { useCurrentUser } from "@/features/auth/hooks/use-current-user";
import { useUpdateUser } from "@/features/auth/hooks/use-update-user";
import { registerForPushNotifications } from "@/services/notifications";

export function usePreferences() {
    const { data: user } = useCurrentUser();
    const updateUser = useUpdateUser();
    const notificationLock = useRef(false);
    const [notificationSaving, setNotificationSaving] = useState(false);

    const [preferences, setPreferences] = useState({
        monthlyIncomeGoal: "",
        dailyIncomeGoal: "",

        minimumHourlyRate: "",
        minimumProfit: "",
        minimumDollarsPerMile: "",
        costPerMile: "",
        preferredMaxDistance: "",

        currency: "USD",
        distanceUnit: "mi",
        weekStartsOn: "sunday",

        notificationsEnabled: false,
        tripRemindersEnabled: false,
        goalRemindersEnabled: false,

        autoTripDetection: false,
    });

    useEffect(() => {
        if (!user) return;

        setPreferences({
            monthlyIncomeGoal: user.monthly_income_goal ?? "",
            dailyIncomeGoal: user.daily_income_goal ?? "",

            minimumHourlyRate: user.minimum_hourly_rate ?? "",
            minimumProfit: user.minimum_profit ?? "",
            minimumDollarsPerMile:
                user.minimum_dollars_per_mile ?? "",
            costPerMile: user.cost_per_mile ?? "",
            preferredMaxDistance:
                user.preferred_max_distance ?? "",

            currency: user.currency,
            distanceUnit: "mi",
            weekStartsOn: user.week_starts_on,

            notificationsEnabled:
                user.notifications_enabled,

            tripRemindersEnabled:
                user.trip_reminders_enabled,

            goalRemindersEnabled:
                user.goal_reminders_enabled,

            autoTripDetection:
                user.auto_trip_detection,
        });
    }, [user]);

    function updateField(
        key: keyof typeof preferences,
        value: string
    ) {
        setPreferences((prev) => ({
            ...prev,
            [key]: value,
        }));
    }

    async function updateToggle(
        key: keyof typeof preferences,
        value: boolean
    ) {
        const notificationField = key === "notificationsEnabled" ? "notifications_enabled"
            : key === "goalRemindersEnabled" ? "goal_reminders_enabled" : null;
        if (notificationField) {
            if (notificationLock.current) return;
            notificationLock.current = true;
            setNotificationSaving(true);
            try {
                if (key === "notificationsEnabled" && value) {
                    await registerForPushNotifications();
                }
                // Notification opt-outs take effect immediately, without waiting for Save.
                await updateCurrentUser({ [notificationField]: value });
                setPreferences(prev => ({ ...prev, [key]: value }));
            } catch {
                Alert.alert("Couldn’t update notifications", "Check your connection and device permissions, then try again.");
            } finally {
                notificationLock.current = false;
                setNotificationSaving(false);
            }
            return;
        }
        setPreferences(prev => ({ ...prev, [key]: value }));
    }

    function updateSelect(
        key: keyof typeof preferences,
        value: string
    ) {
        setPreferences((prev) => ({
            ...prev,
            [key]: value,
        }));
    }

    function savePreferences() {

        updateUser.mutate({
            monthly_income_goal:
                preferences.monthlyIncomeGoal || null,

            daily_income_goal:
                preferences.dailyIncomeGoal || null,

            minimum_hourly_rate:
                preferences.minimumHourlyRate || null,

            minimum_profit:
                preferences.minimumProfit || null,

            minimum_dollars_per_mile:
                preferences.minimumDollarsPerMile || null,

            cost_per_mile:
                preferences.costPerMile || null,

            preferred_max_distance:
                preferences.preferredMaxDistance || null,

            currency: preferences.currency,
            distance_unit: preferences.distanceUnit,
            week_starts_on: preferences.weekStartsOn,

            notifications_enabled:
                preferences.notificationsEnabled,

            trip_reminders_enabled:
                preferences.tripRemindersEnabled,

            goal_reminders_enabled:
                preferences.goalRemindersEnabled,

            auto_trip_detection:
                preferences.autoTripDetection,
        });
    }

    return {
        preferences,
        updateField,
        updateToggle,
        updateSelect,
        savePreferences,
        isSaving: updateUser.isPending || notificationSaving,
    };
}