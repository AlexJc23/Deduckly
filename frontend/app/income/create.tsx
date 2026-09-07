import { SafeAreaView, View } from "@/theme/components";
import { router } from "expo-router";


import { IncomeForm } from "@/features/income/components/IncomeForm";
import { useCreateIncome } from "@/features/income/hooks/use-create-income";
import { BackHeader } from "@/components/ui/BackButton";


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