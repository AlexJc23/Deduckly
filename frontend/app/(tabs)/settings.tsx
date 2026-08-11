import { router } from "expo-router";
import { ScrollView, View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useAuth } from "@/features/auth/context/auth.context";
import { useCurrentUser } from "@/features/auth/hooks/use-current-user";
import PremiumButton from "@/components/ui/PremiumButton";
import { usePremium } from "@/features/subscriptions/hooks/use-premium";

export default function SettingsScreen() {
    const { data: user } = useCurrentUser();
    const { signOut } = useAuth();

    const { isPremium } = usePremium();
    const currentYear = new Date().getFullYear();

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
        >
            <Text style={styles.title}>Settings</Text>

            {/* Profile */}
            <Pressable
                style={styles.card}
                onPress={() => router.push("/settings/edit-profile")}
            >
                <View>
                    <Text style={styles.name}>
                        {user?.first_name} {user?.last_name}
                    </Text>
                    <Text style={styles.subtitle}>{user?.email}</Text>
                </View>

                <Ionicons
                    name="chevron-forward"
                    size={20}
                    color="#9CA3AF"
                />
            </Pressable>

            {!isPremium && (
                <View>
                <View style={{ marginTop: 16 }}>
                    <PremiumButton
                        title="Upgrade to Premium"
                        message="From smarter offer analysis to detailed reports and business insights, Deduckly Pro gives you the tools to maximize every shift."
                        onPress={() => router.push("/screens/paywall")}
                        />
                </View>
            </View>
                    )}

            {/* Preferences */}
            <Text style={styles.sectionTitle}>PREFERENCES</Text>

            <Pressable
                style={styles.card}
                onPress={() => router.push("/screens/PreferenceScreen")}
            >
                <View>
                    <Text style={styles.rowTitle}>Preferences</Text>
                    <Text style={styles.subtitle}>
                        Goals, units and notifications
                    </Text>
                </View>

                <Ionicons
                    name="chevron-forward"
                    size={20}
                    color="#9CA3AF"
                />
            </Pressable>

            {/* Tax */}
            <Text style={styles.sectionTitle}>TAX SETTINGS</Text>

            <Pressable
                style={styles.card}
                onPress={() => router.push("/settings/mileage-rate")}
            >
                <View>
                    <Text style={styles.rowTitle}>Mileage Rate</Text>
                    <Text style={styles.subtitle}>
                        {currentYear} IRS Standard Mileage
                    </Text>
                </View>

                <Ionicons
                    name="chevron-forward"
                    size={20}
                    color="#9CA3AF"
                />
            </Pressable>

            {/* Security */}
            <Text style={styles.sectionTitle}>SECURITY</Text>

            <Pressable
                style={styles.card}
                onPress={() => router.push("/settings/security")}
            >
                <View>
                    <Text style={styles.rowTitle}>Security</Text>
                    <Text style={styles.subtitle}>
                        Password & two-factor authentication
                    </Text>
                </View>

                <Ionicons
                    name="chevron-forward"
                    size={20}
                    color="#9CA3AF"
                />
            </Pressable>

            <Pressable
                style={styles.card}
                onPress={() => router.push("/settings/privacy")}
            >
                <View>
                    <Text style={styles.rowTitle}>Privacy</Text>
                    <Text style={styles.subtitle}>
                        Manage your privacy settings
                    </Text>
                </View>

                <Ionicons
                    name="chevron-forward"
                    size={20}
                    color="#9CA3AF"
                />
            </Pressable>
            <Text style={styles.sectionTitle}>SUPPORT</Text>

            <Pressable
                style={styles.card}
                onPress={() => router.push("/settings/feedback")}
            >
                <View>
                    <Text style={styles.rowTitle}>Feedback</Text>
                    <Text style={styles.subtitle}>
                        Report bugs, request features, or share feedback.
                    </Text>
                </View>

                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </Pressable>

            {/* Legal */}
            <Text style={styles.sectionTitle}>LEGAL</Text>

            <Pressable
                style={styles.card}
                onPress={() =>
                    router.push("/settings/legal/legal-screen")
                }
            >
                <View>
                    <Text style={styles.rowTitle}>Legal</Text>
                    <Text style={styles.subtitle}>
                        Terms of Service & Privacy Policy
                    </Text>
                </View>

                <Ionicons
                    name="chevron-forward"
                    size={20}
                    color="#9CA3AF"
                />
            </Pressable>

            {/* Logout */}
            <Pressable
                style={styles.logoutButton}
                onPress={signOut}
            >
                <Text style={styles.logoutText}>Logout</Text>
            </Pressable>

            <Text style={styles.version}>Version 1.0.0</Text>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F8FAFC",
        paddingTop: 50,
    },

    content: {
        padding: 20,
        paddingBottom: 40,
    },

    title: {
        fontSize: 32,
        fontWeight: "700",
        color: "#111827",
        marginBottom: 24,
    },

    sectionTitle: {
        fontSize: 13,
        fontWeight: "700",
        color: "#6B7280",
        marginBottom: 10,
        marginTop: 20,
        marginLeft: 4,
    },

    card: {
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        padding: 18,
        marginBottom: 12,

        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",

        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 8,
        shadowOffset: {
            width: 0,
            height: 2,
        },

        elevation: 2,
    },

    premiumCard: {
        backgroundColor: "#2DBE60",
        borderRadius: 20,
        padding: 20,
        marginBottom: 12,
    },

    premiumTitle: {
        color: "#FFF",
        fontSize: 24,
        fontWeight: "700",
    },

    premiumSubtitle: {
        color: "#EAF8EF",
        fontSize: 15,
        marginTop: 8,
        lineHeight: 22,
    },

    name: {
        fontSize: 20,
        fontWeight: "700",
        color: "#111827",
    },

    rowTitle: {
        fontSize: 17,
        fontWeight: "600",
        color: "#111827",
    },

    subtitle: {
        color: "#6B7280",
        fontSize: 14,
        marginTop: 4,
    },

    logoutButton: {
        marginTop: 30,
        height: 54,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: "#EF4444",
        justifyContent: "center",
        alignItems: "center",
    },

    logoutText: {
        color: "#EF4444",
        fontWeight: "600",
        fontSize: 16,
    },

    version: {
        textAlign: "center",
        marginTop: 24,
        color: "#9CA3AF",
        fontSize: 13,
    },
});