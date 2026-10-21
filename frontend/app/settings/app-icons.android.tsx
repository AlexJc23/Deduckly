import { SafeAreaView, Text } from "@/theme/components";
import { Translated } from "@/i18n/language";
import { ScreenHeader } from "@/components/ui/ScreenHeader";

export default function AndroidAppIcons() {
  return <SafeAreaView style={{ flex: 1, padding: 24 }}>
    <ScreenHeader title="App Icons" safeArea={false} />
    <Text><Translated text="Custom app icons are available on iOS." /></Text>
  </SafeAreaView>;
}
