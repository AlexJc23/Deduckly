import { View, Text, StyleSheet } from "react-native";

type PreferenceSectionProps = {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
};

export function PreferenceSection({
  title,
  icon,
  children,
}: PreferenceSectionProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {icon}
        <Text style={styles.title}>{title}</Text>
      </View>

      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
    gap: 8,
  },

  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
});