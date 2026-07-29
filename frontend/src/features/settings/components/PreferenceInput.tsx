import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TextInputProps,
} from "react-native";

type PreferenceInputProps = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  helperText?: string;
} & TextInputProps;

export function PreferenceInput({
  label,
  helperText,
  value,
  onChangeText,
  ...props
}: PreferenceInputProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {label}
      </Text>

      {helperText && (
        <Text style={styles.helper}>
          {helperText}
        </Text>
      )}

      <TextInput
        value={value}
        onChangeText={onChangeText}
        style={styles.input}
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },

  label: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },

  helper: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 8,
  },

  input: {
    height: 52,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: "#F9FAFB",
  },
});