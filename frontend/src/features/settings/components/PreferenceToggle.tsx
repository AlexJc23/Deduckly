import { useLanguage, Translated } from "@/i18n/language";
import { Text, View } from "@/theme/components";
import { Switch, StyleSheet } from "react-native";

type PreferenceToggleProps = {
    label: string;
    description?: string;
    value: boolean;
    onValueChange: (value: boolean) => void;
    disabled?: boolean;
    badge?: string;
};

export function PreferenceToggle({
  label,
  description,
  value,
  onValueChange,
  disabled,
}: PreferenceToggleProps) {
  useLanguage();
  return (
    <View style={styles.container}>
      <View style={styles.textContainer}>
        <Text style={styles.label}>
          {<Translated text={label} />}
        </Text>

        {description && (
          <Text style={styles.description}>
            {<Translated text={description} />}
          </Text>
        )}
      </View>

      <Switch
        disabled={disabled}
        value={value}
        onValueChange={onValueChange}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
  },

  textContainer: {
    flex: 1,
    marginRight: 16,
  },

  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },

  description: {
    marginTop: 2,
    fontSize: 13,
    color: "#6B7280",
  },
});