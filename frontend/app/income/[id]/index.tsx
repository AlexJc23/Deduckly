import { useState } from 'react';
import { Image } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { RecordAction, RecordAmount, RecordDetails, RecordDetailsScreen, RecordDetailsStatus, RecordField } from '@/components/ui/RecordDetails';
import { platformIcons, type PlatformName } from '@/constants/platform-icons';
import { PLATFORM_LABELS, SOURCE_LABELS } from '@/constants/platform-labels';
import { DeleteIncomeModal } from '@/features/income/components/DeleteIncomeModal';
import { useDeleteIncome } from '@/features/income/hooks/use-delete-income';
import { useIncomeDetail } from '@/features/income/hooks/use-income-detail';
import { useLanguage } from '@/i18n/language';

const sources: Record<string, string> = {
  ...SOURCE_LABELS,
  gig_platform: 'Gig Platform',
  business: 'Business',
  employment: 'Employment',
  passive: 'Passive income',
  other: 'Other',
};

export default function IncomeDetailsScreen() {
  const { t, locale } = useLanguage();
  const { id } = useLocalSearchParams<{ id: string }>();
  const incomeId = Number(id);
  const validIncomeId = Number.isSafeInteger(incomeId) && incomeId > 0;
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const deleteMutation = useDeleteIncome();
  const query = useIncomeDetail(validIncomeId ? incomeId : 0);
  const income = query.data;

  if (!validIncomeId || query.isPending || query.isError || !income) {
    return (
      <RecordDetailsScreen title="Income Details">
        <RecordDetailsStatus
          loading={validIncomeId && query.isPending}
          message="Failed to load income."
          retry={validIncomeId ? () => void query.refetch({ cancelRefetch: false }) : undefined}
          retrying={query.isFetching}
        />
      </RecordDetailsScreen>
    );
  }

  const received = new Date(income.received_at ?? income.created_at);
  const logo = income.platform && Object.hasOwn(platformIcons, income.platform)
    ? platformIcons[income.platform as PlatformName]
    : undefined;

  return (
    <RecordDetailsScreen title="Income Details">
      <RecordDetails
        summary={<RecordAmount value={income.amount} kind="income" />}
        fields={<>
          <RecordField label="Source" value={t(sources[income.source] ?? 'Unknown')} />
          {income.platform && (
            <RecordField
              label="Platform"
              value={t(PLATFORM_LABELS[income.platform as keyof typeof PLATFORM_LABELS] ?? 'Other')}
              leading={logo && <Image accessible={false} source={logo} resizeMode="contain" style={{ width: 32, height: 26 }} />}
            />
          )}
          {income.business_name && <RecordField label="Business" value={income.business_name} />}
          <RecordField
            label="Received"
            value={Number.isFinite(received.getTime()) ? received.toLocaleString(locale, { dateStyle: 'medium', timeStyle: 'short' }) : t('Not provided')}
          />
        </>}
        aside={income.notes?.trim() ? <RecordField label="Notes" value={income.notes} section /> : undefined}
        actions={<>
          <RecordAction label="Edit Income" icon="create-outline" onPress={() => router.push(`/income/${income.id}/edit`)} />
          <RecordAction label="Delete Income" icon="trash-outline" destructive onPress={() => setShowDeleteModal(true)} />
        </>}
      />
      <DeleteIncomeModal
        visible={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onDelete={async () => {
          setShowDeleteModal(false);
          router.back();
          await deleteMutation.mutateAsync(income.id);
        }}
      />
    </RecordDetailsScreen>
  );
}
