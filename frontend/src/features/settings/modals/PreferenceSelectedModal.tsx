import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

interface Option {
    label: string;
    value: string;
}

interface PreferenceSelectModalProps {
    visible: boolean;
    title: string;
    options: Option[];
    selectedValue: string;
    onClose: () => void;
    onSelect: (value: string) => void;
}

export function PreferenceSelectedModal({
    visible,
    title,
    options,
    selectedValue,
    onClose,
    onSelect,
}: PreferenceSelectModalProps) {
    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent
            onRequestClose={onClose}
        >
            <Pressable
                style={styles.overlay}
                onPress={onClose}
            >
                <View style={styles.sheet}>
                    <Text style={styles.title}>
                        {title}
                    </Text>

                    {options.map((option) => (
                        <Pressable
                            key={option.value}
                            style={styles.option}
                            onPress={() => {
                                onSelect(option.value);
                                onClose();
                            }}
                        >
                            <Text
                                style={[
                                    styles.optionText,
                                    option.value === selectedValue &&
                                        styles.selected,
                                ]}
                            >
                                {option.label}
                            </Text>
                        </Pressable>
                    ))}
                </View>
            </Pressable>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: "flex-end",
        backgroundColor: "rgba(0,0,0,.35)",
    },

    sheet: {
        backgroundColor: "white",
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
    },

    title: {
        fontSize: 20,
        fontWeight: "700",
        marginBottom: 16,
    },

    option: {
        paddingVertical: 18,
    },

    optionText: {
        fontSize: 17,
    },

    selected: {
        color: "#2563EB",
        fontWeight: "700",
    },
});