import { Stack, router, useLocalSearchParams } from "expo-router";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

import { useIncomeDetail } from "@/features/income/hooks/use-income-detail";
import {
  PLATFORM_LABELS,
  SOURCE_LABELS,
} from "@/constants/platform-labels";
import { useState } from "react";
import { DeleteIncomeModal } from "@/features/income/components/DeleteIncomeModal";
import { useDeleteIncome } from "@/features/income/hooks/use-delete-income";
import { BackHeader } from "@/components/ui/BackButton";
import { useIsTablet } from "@/hooks/use-is-tablet";

export default function IncomeDetailsScreen() {
  const { id } = useLocalSearchParams<{
    id: string;
  }>();

  const isTablet = useIsTablet();
  const styles = getStyles(isTablet);

  const [showDeleteModal, setShowDeleteModal] =
    useState(false);

  const deleteMutation = useDeleteIncome();
  const incomeQuery = useIncomeDetail(Number(id));

  if (incomeQuery.isPending) {
    return (
      <View style={styles.center}>
        <ActivityIndicator
          size="small"
          color="#4A6FE3"
        />
      </View>
    );
  }

  if (incomeQuery.isError || !incomeQuery.data) {
    return (
      <View style={styles.center}>
        <Ionicons
          name="alert-circle-outline"
          size={isTablet ? 40 : 32}
          color="#EF4444"
        />

        <Text style={styles.errorTitle}>
          Something went wrong
        </Text>

        <Text style={styles.errorText}>
          Failed to load income.
        </Text>
      </View>
    );
  }

  const income = incomeQuery.data;

  const platformLabel = income.platform
    ? PLATFORM_LABELS[
        income.platform as keyof typeof PLATFORM_LABELS
      ] ?? "Other"
    : income.source ?? "Unknown";

  const sourceLabel = income.source
    ? SOURCE_LABELS[
        income.source as keyof typeof SOURCE_LABELS
      ] ?? "Other"
    : "Unknown";

  return (
    <>
      <Stack.Screen
        options={{
          title: "Income Details",
        }}
      />

      <BackHeader />

      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.contentInner}>
          <View style={styles.header}>
            <Text style={styles.eyebrow}>
              INCOME
            </Text>

            <Text style={styles.title}>
              Income Details
            </Text>

            <Text style={styles.subtitle}>
              Review the details of this income entry.
            </Text>
          </View>

          <View style={styles.card}>
            <View style={styles.amountSection}>
              <View style={styles.incomeIcon}>
                <Ionicons
                  name="arrow-down"
                  size={isTablet ? 24 : 20}
                  color="#22C55E"
                />
              </View>

              <Text style={styles.amountLabel}>
                Amount
              </Text>

              <Text style={styles.amount}>
                ${Number(income.amount).toFixed(2)}
              </Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.detailRow}>
              <Text style={styles.label}>
                Source
              </Text>

              <Text style={styles.value}>
                {sourceLabel}
              </Text>
            </View>

            {income.platform && (
              <View style={styles.detailRow}>
                <Text style={styles.label}>
                  Platform
                </Text>

                <Text style={styles.value}>
                  {platformLabel}
                </Text>
              </View>
            )}

            {income.business_name && (
              <View style={styles.detailRow}>
                <Text style={styles.label}>
                  Business
                </Text>

                <Text
                  style={styles.value}
                  numberOfLines={2}
                >
                  {income.business_name}
                </Text>
              </View>
            )}

            <View style={styles.detailRow}>
              <Text style={styles.label}>
                Received
              </Text>

              <Text style={styles.value}>
                {new Date(
                  income.received_at ??
                    income.created_at,
                ).toLocaleString()}
              </Text>
            </View>

            {income.notes && (
              <View style={styles.notesSection}>
                <Text style={styles.label}>
                  Notes
                </Text>

                <Text style={styles.notes}>
                  {income.notes}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.buttonContainer}>
            <Pressable
              style={({ pressed }) => [
                styles.button,
                pressed && styles.buttonPressed,
              ]}
              onPress={() =>
                router.push(
                  `/income/${income.id}/edit`,
                )
              }
            >
              <Ionicons
                name="create-outline"
                size={isTablet ? 22 : 18}
                color="#FFFFFF"
              />

              <Text style={styles.buttonText}>
                Edit Income
              </Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.deleteButton,
                pressed &&
                  styles.deleteButtonPressed,
              ]}
              onPress={() =>
                setShowDeleteModal(true)
              }
            >
              <Ionicons
                name="trash-outline"
                size={isTablet ? 22 : 18}
                color="#EF4444"
              />

              <Text style={styles.deleteText}>
                Delete Income
              </Text>
            </Pressable>
          </View>
        </View>

        <DeleteIncomeModal
          visible={showDeleteModal}
          onClose={() =>
            setShowDeleteModal(false)
          }
          onDelete={async () => {
            setShowDeleteModal(false);
            router.back();

            await deleteMutation.mutateAsync(
              income.id,
            );
          }}
        />
      </ScrollView>
    </>
  );
}

const getStyles = (isTablet: boolean) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: "#F8FAFC",
    },

    center: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "#F8FAFC",
      paddingHorizontal: isTablet ? 60 : 24,
    },

    errorTitle: {
      marginTop: isTablet ? 16 : 12,
      fontSize: isTablet ? 22 : 17,
      fontWeight: "700",
      color: "#111827",
    },

    errorText: {
      marginTop: 5,
      fontSize: isTablet ? 15 : 14,
      color: "#64748B",
    },

    container: {
      paddingHorizontal: isTablet ? 34 : 20,
      paddingTop: isTablet ? 24 : 20,
      paddingBottom: isTablet ? 60 : 48,
    },

    contentInner: {
      width: "100%",
      maxWidth: isTablet ? 1000 : undefined,
      alignSelf: isTablet ? "center" : undefined,
    },

    header: {
      marginBottom: isTablet ? 28 : 20,
    },

    eyebrow: {
      fontSize: isTablet ? 11 : 10,
      fontWeight: "800",
      letterSpacing: 1.2,
      color: "#64748B",
      marginBottom: 5,
    },

    title: {
      fontSize: isTablet ? 36 : 28,
      lineHeight: isTablet ? 43 : 34,
      fontWeight: "800",
      letterSpacing: -0.7,
      color: "#111827",
    },

    subtitle: {
      marginTop: isTablet ? 7 : 5,
      fontSize: isTablet ? 15 : 14,
      lineHeight: isTablet ? 22 : 20,
      color: "#64748B",
    },

    card: {
      backgroundColor: "#FFFFFF",
      borderRadius: isTablet ? 22 : 18,
      borderWidth: 1,
      borderColor: "#E5E7EB",
      padding: isTablet ? 26 : 18,

      shadowColor: "#111827",
      shadowOpacity: 0.04,
      shadowRadius: 10,
      shadowOffset: {
        width: 0,
        height: 3,
      },

      elevation: 2,
    },

    amountSection: {
      alignItems: "center",
      paddingVertical: isTablet ? 10 : 6,
    },

    incomeIcon: {
      width: isTablet ? 58 : 44,
      height: isTablet ? 58 : 44,
      borderRadius: isTablet ? 17 : 13,
      backgroundColor: "#DCFCE7",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: isTablet ? 13 : 10,
    },

    amountLabel: {
      fontSize: isTablet ? 14 : 12,
      fontWeight: "600",
      color: "#64748B",
    },

    amount: {
      marginTop: 4,
      fontSize: isTablet ? 44 : 32,
      lineHeight: isTablet ? 52 : 38,
      fontWeight: "800",
      letterSpacing: -0.8,
      color: "#22C55E",
    },

    divider: {
      height: 1,
      backgroundColor: "#E5E7EB",
      marginVertical: isTablet ? 22 : 18,
    },

    detailRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: isTablet ? 30 : 20,
      paddingVertical: isTablet ? 13 : 9,
    },

    label: {
      fontSize: isTablet ? 14 : 13,
      fontWeight: "600",
      color: "#64748B",
    },

    value: {
      flex: 1,
      textAlign: "right",
      fontSize: isTablet ? 16 : 14,
      lineHeight: isTablet ? 23 : 20,
      fontWeight: "600",
      color: "#111827",
    },

    notesSection: {
      marginTop: isTablet ? 10 : 8,
      paddingTop: isTablet ? 19 : 16,
      borderTopWidth: 1,
      borderTopColor: "#F1F5F9",
    },

    notes: {
      marginTop: 8,
      fontSize: isTablet ? 16 : 14,
      lineHeight: isTablet ? 24 : 21,
      color: "#334155",
    },

    buttonContainer: {
      marginTop: isTablet ? 24 : 20,
    },

    button: {
      minHeight: isTablet ? 64 : 52,
      borderRadius: isTablet ? 17 : 13,
      backgroundColor: "#4A6FE3",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 9,
    },

    buttonPressed: {
      backgroundColor: "#3559C7",
      transform: [{ scale: 0.985 }],
    },

    buttonText: {
      color: "#FFFFFF",
      fontSize: isTablet ? 17 : 15,
      fontWeight: "700",
    },

    deleteButton: {
      minHeight: isTablet ? 60 : 50,
      marginTop: isTablet ? 12 : 10,
      borderRadius: isTablet ? 17 : 13,
      backgroundColor: "#FFFFFF",
      borderWidth: 1,
      borderColor: "#FECACA",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 9,
    },

    deleteButtonPressed: {
      backgroundColor: "#FEF2F2",
      transform: [{ scale: 0.985 }],
    },

    deleteText: {
      color: "#EF4444",
      fontSize: isTablet ? 17 : 15,
      fontWeight: "700",
    },
  });