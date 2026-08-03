import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { IncomeForm } from "@/features/income/components/IncomeForm";
import { useCreateIncome } from "@/features/income/hooks/use-create-income";
import { BackHeader } from "@/components/ui/BackButton";
import { View } from "react-native";

export default function CreateIncomeScreen() {
  const createIncomeMutation = useCreateIncome();

  function handleSubmit(values: any) {
    createIncomeMutation.mutate(values, {
      onSuccess: () => {
        router.back();
      },
    });
  }

  return (
    <View style={{ flex: 1 }}>
      <BackHeader />
      <IncomeForm
        submitLabel="Create Income"
        loading={createIncomeMutation.isPending}
        onSubmit={handleSubmit}
      />
    </View>
  );
}