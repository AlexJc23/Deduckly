import { useLanguage, Translated } from "@/i18n/language";
import { Pressable, ScrollView, Text, View, AnimatedView } from "@/theme/components";
import { useEffect, useRef, useState } from "react";
import { Animated, Modal, StyleSheet, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@/theme/icons";

interface PreferenceSelectModalProps {
    visible: boolean;
    title: string;
    options: { label: string; value: string }[];
    selectedValue: string;
    onClose: () => void;
    onSelect: (value: string) => void;
}

export function PreferenceSelectedModal({ visible, title, options, selectedValue, onClose, onSelect }: PreferenceSelectModalProps) {
  useLanguage();
    const [mounted, setMounted] = useState(visible);
    const progress = useRef(new Animated.Value(0)).current;
    const { height, width } = useWindowDimensions();
    const insets = useSafeAreaInsets();
    const isTablet = width >= 768;

    useEffect(() => {
        if (visible) setMounted(true);
        const animation = Animated.timing(progress, {
            toValue: visible ? 1 : 0,
            duration: visible ? 280 : 220,
            useNativeDriver: true,
        });
        animation.start(({ finished }) => {
            if (finished && !visible) setMounted(false);
        });
        return () => animation.stop();
    }, [visible, progress]);

    return (
        <Modal visible={mounted} animationType="none" transparent onRequestClose={onClose} statusBarTranslucent>
            <View style={styles.overlay}>
                <AnimatedView style={[StyleSheet.absoluteFill, { backgroundColor: "rgba(15,23,42,0.4)", opacity: progress }]}>
                    <Pressable style={StyleSheet.absoluteFill} accessibilityRole="button" accessibilityLabel="Close selection" onPress={onClose} />
                </AnimatedView>
                <AnimatedView style={[styles.sheet, {
                    maxHeight: height - insets.top - 24,
                    paddingBottom: Math.max(insets.bottom, 20),
                    marginBottom: isTablet ? Math.max(insets.bottom, 24) : 0,
                    borderBottomLeftRadius: isTablet ? 24 : 0,
                    borderBottomRightRadius: isTablet ? 24 : 0,
                    transform: [{ translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [height, 0] }) }],
                }]}>
                    <View style={styles.header}>
                        <Text style={styles.title}>{<Translated text={title} />}</Text>
                        <Pressable style={styles.close} accessibilityRole="button" accessibilityLabel="Close selection" onPress={onClose}>
                            <Ionicons name="close" size={22} color="#64748B" />
                        </Pressable>
                    </View>
                    <ScrollView bounces={false}>
                        {options.map(option => (
                            <Pressable key={option.value} accessibilityRole="radio" accessibilityState={{ checked: option.value === selectedValue }} style={styles.option} onPress={() => { onSelect(option.value); onClose(); }}>
                                <Text style={[styles.optionText, option.value === selectedValue && styles.selected]}>{<Translated text={option.label} />}</Text>
                                {option.value === selectedValue && <Ionicons name="checkmark" size={22} color="#0072B5" />}
                            </Pressable>
                        ))}
                    </ScrollView>
                </AnimatedView>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: { flex: 1, justifyContent: "flex-end", alignItems: "center" },
    sheet: { backgroundColor: "#FFFFFF", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, width: "100%", maxWidth: 560 },
    header: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
    title: { flex: 1, fontSize: 20, fontWeight: "700", color: "#273449" },
    close: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
    option: { minHeight: 56, paddingVertical: 16, flexDirection: "row", alignItems: "center", gap: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#E2E8F0" },
    optionText: { flex: 1, fontSize: 17, color: "#273449" },
    selected: { color: "#0072B5", fontWeight: "700" },
});
