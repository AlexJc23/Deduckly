import { useEffect, useState } from "react";

import { useCurrentUser } from "@/features/auth/hooks/use-current-user";
import { useUpdateUser } from "@/features/auth/hooks/use-update-user";

export function usePreferences() {
    const { data: user } = useCurrentUser();
    const updateUser = useUpdateUser();

    const [preferences, setPreferences] = useState({
        monthlyIncomeGoal: "",
        weeklyIncomeGoal: "",

        minimumHourlyRate: "",
        minimumProfit: "",
        minimumDollarsPerMile: "",
        costPerMile: "",
        preferredMaxDistance: "",

        currency: "USD",
        distanceUnit: "miles",
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
            weeklyIncomeGoal: user.weekly_income_goal ?? "",

            minimumHourlyRate: user.minimum_hourly_rate ?? "",
            minimumProfit: user.minimum_profit ?? "",
            minimumDollarsPerMile:
                user.minimum_dollars_per_mile ?? "",
            costPerMile: user.cost_per_mile ?? "",
            preferredMaxDistance:
                user.preferred_max_distance ?? "",

            currency: user.currency,
            distanceUnit: user.distance_unit,
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

    function updateToggle(
        key: keyof typeof preferences,
        value: boolean
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

            weekly_income_goal:
                preferences.weeklyIncomeGoal || null,

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

    function updateSelect(
        key: keyof typeof preferences,
        value: string
    ) {
        setPreferences(prev => ({
            ...prev,
            [key]: value,
        }));
    }

    return {
        preferences,
        updateField,
        updateToggle,
        savePreferences,
        updateSelect,
        isSaving: updateUser.isPending,
    };
}