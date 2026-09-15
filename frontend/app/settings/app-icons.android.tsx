import { SafeAreaView, Text } from "@/theme/components";
import { Translated } from "@/i18n/language";
import { BackHeader } from "@/components/ui/BackButton";

export default function AndroidAppIcons() {
  return <SafeAreaView style={{ flex: 1, padding: 24 }}>
    <BackHeader />
    <Text><Translated text="Custom app icons are available on iOS." /></Text>
  </SafeAreaView>;
}
