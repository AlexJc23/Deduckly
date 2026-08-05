import { router, Stack, useLocalSearchParams } from "expo-router";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { IncomeForm } from "@/features/income/components/IncomeForm";
import { useIncomeDetail } from "@/features/income/hooks/use-income-detail";
import { useUpdateIncome } from "@/features/income/hooks/use-update-income";
import { UpdateIncomeRequest } from "@/features/income/types/income";
import { BackHeader } from "@/components/ui/BackButton";

export default function EditIncomeScreen() {
  const { id } = useLocalSearchParams<{
    id: string;
  }>();

  const incomeId = Number(id);

  const incomeQuery = useIncomeDetail(incomeId);
  const updateIncomeMutation = useUpdateIncome();

  function handleSubmit(values: UpdateIncomeRequest) {
    updateIncomeMutation.mutate(
      {
        incomeId,
        income: values,
      },
      {
        onSuccess: () => {
          router.back();
        },
      },
    );
  }

  if (incomeQuery.isPending) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  if (incomeQuery.isError || !incomeQuery.data) {
    return (
      <View style={styles.center}>
        <Text>Failed to load income.</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: "Edit Income",
        }}
      />
        <BackHeader />
        <IncomeForm
            initialValues={incomeQuery.data}
            submitLabel="Save Changes"
            loading={updateIncomeMutation.isPending}
            onSubmit={handleSubmit}
        />
    </>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});