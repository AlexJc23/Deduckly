import { useCallback, useState } from 'react';
import { Image, StyleSheet } from 'react-native';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { RecordAction, RecordAmount, RecordDetails, RecordDetailsScreen, RecordDetailsStatus, RecordField } from '@/components/ui/RecordDetails';
import { EXPENSE_CATEGORY_LABELS } from '@/constants/expense-category-labels';
import { useDeleteExpense } from '@/features/expenses/hooks/use-delete-expense';
import { useExpenseDetail } from '@/features/expenses/hooks/use-expense-detail';
import { DeleteExpenseModal } from '@/features/expenses/modals/DeleteExpenseModal';
import { useLanguage } from '@/i18n/language';
import { Text, View } from '@/theme/components';

export default function ExpenseDetailsScreen() {
  const { t, locale } = useLanguage();
  const { id } = useLocalSearchParams<{ id: string }>();
  const expenseId = Number(id);
  const validExpenseId = Number.isSafeInteger(expenseId) && expenseId > 0;
  const query = useExpenseDetail(expenseId);
  const { refetch } = query;
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const deleteMutation = useDeleteExpense();

  useFocusEffect(
    useCallback(() => {
      if (validExpenseId) void refetch({ cancelRefetch: false });
    }, [expenseId, validExpenseId, refetch]),
  );

  const expense = query.data;
  if (!validExpenseId || query.isPending || query.isError || !expense) {
    return (
      <RecordDetailsScreen title="Expense Details">
        <RecordDetailsStatus
          loading={validExpenseId && query.isPending}
          message="Failed to load expense."
          retry={validExpenseId ? () => void refetch({ cancelRefetch: false }) : undefined}
          retrying={query.isFetching}
        />
      </RecordDetailsScreen>
    );
  }

  const date = new Date(expense.incurred_at);
  return (
    <RecordDetailsScreen title="Expense Details">
      <RecordDetails
        summary={<RecordAmount value={expense.amount} kind="expense" />}
        fields={<>
          <RecordField label="Category" value={t(EXPENSE_CATEGORY_LABELS[expense.category] ?? 'Other')} />
          <RecordField label="Merchant" value={expense.merchant?.trim() || t('Not provided')} />
          <RecordField
            label="Date"
            value={Number.isFinite(date.getTime()) ? date.toLocaleDateString(locale, { dateStyle: 'medium' }) : t('Not provided')}
          />
          <RecordField label="Business Percentage" value={`${expense.business_percentage}%`} />
        </>}
        aside={<>
          {expense.description?.trim() && <RecordField label="Description" value={expense.description} section />}
          <Text accessibilityRole="header" style={styles.sectionTitle}>{t('Receipt')}</Text>
          {expense.receipt_url ? (
            <View style={styles.receipt}>
              <Image accessible accessibilityLabel={t('Receipt')} source={{ uri: expense.receipt_url }} resizeMode="contain" style={styles.preview} />
            </View>
          ) : <Text style={styles.empty}>{t('No receipt attached')}</Text>}
        </>}
        actions={<>
          <RecordAction label="Edit Expense" icon="create-outline" onPress={() => router.push(`/expense/${expense.id}/edit`)} />
          <RecordAction label="Delete Expense" icon="trash-outline" destructive onPress={() => setShowDeleteModal(true)} />
        </>}
      />
      <DeleteExpenseModal
        visible={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onDelete={() => {
          deleteMutation.mutate(expense.id, {
            onSuccess: () => {
              setShowDeleteModal(false);
              router.back();
            },
          });
        }}
      />
    </RecordDetailsScreen>
  );
}

const styles = StyleSheet.create({
  sectionTitle: { fontSize: 18, fontWeight: '700' },
  empty: { fontSize: 14, color: '#64748B' },
  receipt: { backgroundColor: '#F1F5F9', borderRadius: 12, padding: 8 },
  preview: { width: '100%', height: 240 },
});
