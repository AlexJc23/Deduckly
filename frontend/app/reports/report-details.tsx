import { useLanguage, Translated } from "@/i18n/language";
import { View, Text } from "@/theme/components";


export default function ReportDetailsScreen() {
  useLanguage();
  return (
    <View>
      <Text><Translated text={"Report Details"} /></Text>
    </View>
  );
}