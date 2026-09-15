import { localizedAlert } from "@/i18n/alerts";
import { Platform } from "react-native";
import { SafeAreaView, View } from "@/theme/components";
import { router } from "expo-router";


import { IncomeForm } from "@/features/income/components/IncomeForm";
import { useCreateIncome } from "@/features/income/hooks/use-create-income";
import { BackHeader } from "@/components/ui/BackButton";


export default function CreateIncomeScreen() {
  const createIncomeMutation = useCreateIncome();

  function handleSubmit(values: any) {
    createIncomeMutation.mutate(values, {
      ...(Platform.OS === "android" ? { onError: () => localizedAlert("Income could not be saved", "Check your connection and try again. Your entries are still on this screen.") } : {}),
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