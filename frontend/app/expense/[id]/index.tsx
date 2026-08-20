import {
  Stack,
  useLocalSearchParams,
  router,
} from "expo-router";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Image,
} from "react-native";
import { useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";

import { useDeleteExpense } from "@/features/expenses/hooks/use-delete-expense";
import { useExpenseDetail } from "@/features/expenses/hooks/use-expense-detail";
import { DeleteExpenseModal } from "@/features/expenses/modals/DeleteExpenseModal";
import { EXPENSE_CATEGORY_LABELS } from "@/constants/expense-category-labels";
import { BackHeader } from "@/components/ui/BackButton";
import { useIsTablet } from "@/hooks/use-is-tablet";

export default function ExpenseDetailsScreen() {
  const { id } = useLocalSearchParams<{
    id: string;
  }>();

  const expenseId = Number(id);
  const isTablet = useIsTablet();
  const styles = getStyles(isTablet);

  const expenseQuery =
    useExpenseDetail(expenseId);

  const [showDeleteModal, setShowDeleteModal] =
    useState(false);

  const deleteMutation = useDeleteExpense();

  useFocusEffect(
    useCallback(() => {
      expenseQuery.refetch();
    }, [expenseQuery]),
  );

  if (expenseQuery.isPending) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  if (
    expenseQuery.isError ||
    !expenseQuery.data
  ) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>
          Failed to load expense.
        </Text>
      </View>
    );
  }

  const expense = expenseQuery.data;

  return (
    <>
      <Stack.Screen
        options={{
          title: "Expense Details",
          headerShown: false,
        }}
      />

      <BackHeader />

      <ScrollView
        style={styles.screen}
        contentContainerStyle={
          styles.container
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.contentInner}>
          <View style={styles.header}>
            <Text style={styles.eyebrow}>
              EXPENSE
            </Text>

            <Text style={styles.title}>
              Expense Details
            </Text>

            <Text style={styles.subtitle}>
              Review the details of this expense.
            </Text>
          </View>

          <View style={styles.card}>
            <View style={styles.amountSection}>
              <Text style={styles.amountLabel}>
                Amount
              </Text>

              <Text style={styles.amount}>
                $
                {Number(expense.amount).toFixed(
                  2,
                )}
              </Text>
            </View>

            <View style={styles.divider} />

            <DetailRow
              label="Date"
              value={new Date(
                expense.incurred_at,
              ).toLocaleDateString()}
              isTablet={isTablet}
            />

            <DetailRow
              label="Category"
              value={
                EXPENSE_CATEGORY_LABELS[
                  expense.category
                ]
              }
              isTablet={isTablet}
            />

            <DetailRow
              label="Merchant"
              value={
                expense.merchant ??
                "Not provided"
              }
              isTablet={isTablet}
            />

            <DetailRow
              label="Description"
              value={
                expense.description ??
                "Not provided"
              }
              isTablet={isTablet}
            />

            <DetailRow
              label="Business Percentage"
              value={`${expense.business_percentage}%`}
              isTablet={isTablet}
            />
          </View>

          <View style={styles.receiptCard}>
            <Text style={styles.sectionTitle}>
              Receipt
            </Text>

            {expense.receipt_url ? (
              <Image
                source={{
                  uri: expense.receipt_url,
                }}
                style={styles.receiptImage}
              />
            ) : (
              <View style={styles.noReceipt}>
                <Text
                  style={
                    styles.noReceiptText
                  }
                >
                  No receipt attached
                </Text>
              </View>
            )}
          </View>

          <View style={styles.buttonContainer}>
            <Pressable
              style={({ pressed }) => [
                styles.editButton,
                pressed &&
                  styles.editButtonPressed,
              ]}
              onPress={() =>
                router.push(
                  `/expense/${expense.id}/edit`,
                )
              }
            >
              <Text
                style={styles.editButtonText}
              >
                Edit Expense
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
              <Text
                style={
                  styles.deleteButtonText
                }
              >
                Delete Expense
              </Text>
            </Pressable>
          </View>

          <DeleteExpenseModal
            visible={showDeleteModal}
            onClose={() =>
              setShowDeleteModal(false)
            }
            onDelete={() => {
              deleteMutation.mutate(
                expense.id,
                {
                  onSuccess: () => {
                    setShowDeleteModal(false);
                    router.back();
                  },
                },
              );
            }}
          />
        </View>
      </ScrollView>
    </>
  );
}

function DetailRow({
  label,
  value,
  isTablet,
}: {
  label: string;
  value: string;
  isTablet: boolean;
}) {
  const styles = getStyles(isTablet);

  return (
    <View style={styles.row}>
      <Text style={styles.label}>
        {label}
      </Text>

      <Text style={styles.value}>
        {value}
      </Text>
    </View>
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
    },

    errorText: {
      fontSize: isTablet ? 17 : 15,
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
      marginTop: 7,
      fontSize: isTablet ? 15 : 14,
      lineHeight: isTablet ? 22 : 20,
      color: "#64748B",
    },

    card: {
      backgroundColor: "#FFFFFF",
      borderRadius: isTablet ? 22 : 18,
      borderWidth: 1,
      borderColor: "#E5E7EB",
      padding: isTablet ? 24 : 18,

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
      paddingVertical: isTablet ? 6 : 4,
    },

    amountLabel: {
      fontSize: isTablet ? 14 : 13,
      fontWeight: "700",
      color: "#64748B",
      marginBottom: 6,
    },

    amount: {
      fontSize: isTablet ? 42 : 32,
      lineHeight: isTablet ? 50 : 38,
      fontWeight: "800",
      color: "#111827",
      letterSpacing: -0.7,
    },

    divider: {
      height: 1,
      backgroundColor: "#E5E7EB",
      marginVertical: isTablet ? 10 : 6,
    },

    row: {
      paddingVertical: isTablet ? 15 : 12,
    },

    label: {
      fontSize: isTablet ? 13 : 12,
      fontWeight: "700",
      color: "#64748B",
      marginBottom: 5,
    },

    value: {
      fontSize: isTablet ? 17 : 15,
      lineHeight: isTablet ? 24 : 21,
      color: "#111827",
      fontWeight: "600",
    },

    receiptCard: {
      marginTop: isTablet ? 20 : 16,
      backgroundColor: "#FFFFFF",
      borderRadius: isTablet ? 22 : 18,
      borderWidth: 1,
      borderColor: "#E5E7EB",
      padding: isTablet ? 24 : 18,

      shadowColor: "#111827",
      shadowOpacity: 0.04,
      shadowRadius: 10,
      shadowOffset: {
        width: 0,
        height: 3,
      },

      elevation: 2,
    },

    sectionTitle: {
      fontSize: isTablet ? 19 : 16,
      fontWeight: "800",
      color: "#111827",
      marginBottom: isTablet ? 15 : 12,
    },

    receiptImage: {
      width: "100%",
      height: isTablet ? 380 : 240,
      borderRadius: isTablet ? 16 : 13,
      resizeMode: "cover",
    },

    noReceipt: {
      height: isTablet ? 130 : 90,
      borderWidth: 1,
      borderStyle: "dashed",
      borderColor: "#CBD5E1",
      borderRadius: isTablet ? 16 : 13,
      backgroundColor: "#F8FAFC",
      alignItems: "center",
      justifyContent: "center",
    },

    noReceiptText: {
      fontSize: isTablet ? 15 : 13,
      color: "#94A3B8",
      fontWeight: "600",
    },

    buttonContainer: {
      marginTop: isTablet ? 24 : 18,
    },

    editButton: {
      minHeight: isTablet ? 64 : 52,
      backgroundColor: "#4A6FE3",
      borderRadius: isTablet ? 17 : 13,
      alignItems: "center",
      justifyContent: "center",
    },

    editButtonPressed: {
      backgroundColor: "#3559C7",
      transform: [{ scale: 0.985 }],
    },

    editButtonText: {
      color: "#FFFFFF",
      fontSize: isTablet ? 17 : 15,
      fontWeight: "700",
    },

    deleteButton: {
      minHeight: isTablet ? 60 : 50,
      marginTop: isTablet ? 12 : 10,
      backgroundColor: "#FEF2F2",
      borderRadius: isTablet ? 17 : 13,
      borderWidth: 1,
      borderColor: "#FECACA",
      alignItems: "center",
      justifyContent: "center",
    },

    deleteButtonPressed: {
      backgroundColor: "#FEE2E2",
      transform: [{ scale: 0.985 }],
    },

    deleteButtonText: {
      color: "#DC2626",
      fontSize: isTablet ? 17 : 15,
      fontWeight: "700",
    },
  });