import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface PreferencePickerProps {
    label: string;
    value: React.ReactNode;
    onPress: () => void;
    helperText?: string;
    disabled?: boolean;
}

export function PreferencePicker({
    label,
    value,
    onPress,
    helperText,
    disabled = false,
}: PreferencePickerProps) {
    return (
        <Pressable
            style={({ pressed }) => [
                styles.container,
                pressed && !disabled && styles.pressed,
                disabled && styles.disabled,
            ]}
            onPress={onPress}
            disabled={disabled}
        >
            <View style={styles.left}>
                <Text style={styles.label}>{label}</Text>

                {helperText && (
                    <Text style={styles.helperText}>
                        {helperText}
                    </Text>
                )}
            </View>

            <View style={styles.right}>
                <Text style={styles.value}>{value}</Text>

                <Ionicons
                    name="chevron-forward"
                    size={18}
                    color="#94A3B8"
                />
            </View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",

        paddingVertical: 16,

        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: "#E2E8F0",
    },

    left: {
        flex: 1,
        paddingRight: 16,
    },

    label: {
        fontSize: 16,
        fontWeight: "600",
        color: "#0F172A",
    },

    helperText: {
        marginTop: 4,
        fontSize: 13,
        color: "#64748B",
    },

    right: {
        flexDirection: "row",
        alignItems: "center",
    },

    value: {
        fontSize: 15,
        color: "#64748B",
        marginRight: 6,
    },

    pressed: {
        opacity: 0.7,
    },

    disabled: {
        opacity: 0.5,
    },
});