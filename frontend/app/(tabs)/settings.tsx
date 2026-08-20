import { router } from "expo-router";
import {
    ScrollView,
    View,
    Text,
    Pressable,
    StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useAuth } from "@/features/auth/context/auth.context";
import { useCurrentUser } from "@/features/auth/hooks/use-current-user";
import PremiumButton from "@/components/ui/PremiumButton";
import { usePremium } from "@/features/subscriptions/hooks/use-premium";
import { useIsTablet } from "@/hooks/use-is-tablet";

export default function SettingsScreen() {
    const { data: user } = useCurrentUser();
    const { signOut } = useAuth();
    const { isPremium } = usePremium();
    const isTablet = useIsTablet();
    const styles = getStyles(isTablet);

    const currentYear = new Date().getFullYear();

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
        >
            <View style={styles.contentInner}>
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
                        <Text style={styles.subtitle}>
                            {user?.email}
                        </Text>
                    </View>

                    <Ionicons
                        name="chevron-forward"
                        size={isTablet ? 24 : 20}
                        color="#9CA3AF"
                    />
                </Pressable>

                {!isPremium && (
                    <View style={styles.premiumWrapper}>
                        <PremiumButton
                            title="Upgrade to Premium"
                            message="From smarter offer analysis to detailed reports and business insights, Deduckly Pro gives you the tools to maximize every shift."
                            onPress={() =>
                                router.push("/screens/paywall")
                            }
                        />
                    </View>
                )}

                {/* Preferences */}
                <Text style={styles.sectionTitle}>
                    PREFERENCES
                </Text>

                <Pressable
                    style={styles.card}
                    onPress={() =>
                        router.push("/screens/PreferenceScreen")
                    }
                >
                    <View style={styles.rowContent}>
                        <Text style={styles.rowTitle}>
                            Preferences
                        </Text>

                        <Text style={styles.subtitle}>
                            Goals, units and notifications
                        </Text>
                    </View>

                    <Ionicons
                        name="chevron-forward"
                        size={isTablet ? 24 : 20}
                        color="#9CA3AF"
                    />
                </Pressable>

                {/* Tax */}
                <Text style={styles.sectionTitle}>
                    TAX SETTINGS
                </Text>

                <Pressable
                    style={styles.card}
                    onPress={() =>
                        router.push("/settings/mileage-rate")
                    }
                >
                    <View style={styles.rowContent}>
                        <Text style={styles.rowTitle}>
                            Mileage Rate
                        </Text>

                        <Text style={styles.subtitle}>
                            {currentYear} IRS Standard Mileage
                        </Text>
                    </View>

                    <Ionicons
                        name="chevron-forward"
                        size={isTablet ? 24 : 20}
                        color="#9CA3AF"
                    />
                </Pressable>

                {/* Security */}
                <Text style={styles.sectionTitle}>
                    SECURITY
                </Text>

                <Pressable
                    style={styles.card}
                    onPress={() =>
                        router.push("/settings/security")
                    }
                >
                    <View style={styles.rowContent}>
                        <Text style={styles.rowTitle}>
                            Security
                        </Text>

                        <Text style={styles.subtitle}>
                            Password & two-factor authentication
                        </Text>
                    </View>

                    <Ionicons
                        name="chevron-forward"
                        size={isTablet ? 24 : 20}
                        color="#9CA3AF"
                    />
                </Pressable>

                <Pressable
                    style={styles.card}
                    onPress={() =>
                        router.push("/settings/privacy")
                    }
                >
                    <View style={styles.rowContent}>
                        <Text style={styles.rowTitle}>
                            Privacy
                        </Text>

                        <Text style={styles.subtitle}>
                            Manage your privacy settings
                        </Text>
                    </View>

                    <Ionicons
                        name="chevron-forward"
                        size={isTablet ? 24 : 20}
                        color="#9CA3AF"
                    />
                </Pressable>

                {/* Support */}
                <Text style={styles.sectionTitle}>
                    SUPPORT
                </Text>

                <Pressable
                    style={styles.card}
                    onPress={() =>
                        router.push("/settings/feedback")
                    }
                >
                    <View style={styles.rowContent}>
                        <Text style={styles.rowTitle}>
                            Feedback
                        </Text>

                        <Text style={styles.subtitle}>
                            Report bugs, request features, or share feedback.
                        </Text>
                    </View>

                    <Ionicons
                        name="chevron-forward"
                        size={isTablet ? 24 : 20}
                        color="#9CA3AF"
                    />
                </Pressable>

                {/* Legal */}
                <Text style={styles.sectionTitle}>
                    LEGAL
                </Text>

                <Pressable
                    style={styles.card}
                    onPress={() =>
                        router.push("/settings/legal/legal-screen")
                    }
                >
                    <View style={styles.rowContent}>
                        <Text style={styles.rowTitle}>
                            Legal
                        </Text>

                        <Text style={styles.subtitle}>
                            Terms of Service & Privacy Policy
                        </Text>
                    </View>

                    <Ionicons
                        name="chevron-forward"
                        size={isTablet ? 24 : 20}
                        color="#9CA3AF"
                    />
                </Pressable>

                {/* Logout */}
                <Pressable
                    style={styles.logoutButton}
                    onPress={signOut}
                >
                    <Text style={styles.logoutText}>
                        Logout
                    </Text>
                </Pressable>

                <Text style={styles.version}>
                    Version 1.0.0
                </Text>
            </View>
        </ScrollView>
    );
}

const getStyles = (isTablet: boolean) =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: "#F8FAFC",
            paddingTop: isTablet ? 28 : 50,
        },

        content: {
            paddingHorizontal: isTablet ? 34 : 20,
            paddingBottom: isTablet ? 60 : 40,
        },

        contentInner: {
            width: "100%",
            maxWidth: isTablet ? 1000 : undefined,
            alignSelf: isTablet ? "center" : undefined,
        },

        title: {
            fontSize: isTablet ? 38 : 32,
            fontWeight: "700",
            color: "#111827",
            marginBottom: isTablet ? 30 : 24,
        },

        sectionTitle: {
            fontSize: isTablet ? 14 : 13,
            fontWeight: "700",
            color: "#6B7280",
            marginBottom: isTablet ? 12 : 10,
            marginTop: isTablet ? 26 : 20,
            marginLeft: 4,
            letterSpacing: isTablet ? 0.2 : 0,
        },

        card: {
            backgroundColor: "#FFFFFF",
            borderRadius: isTablet ? 18 : 16,
            padding: isTablet ? 22 : 18,
            minHeight: isTablet ? 76 : undefined,
            marginBottom: isTablet ? 14 : 12,

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

        premiumWrapper: {
            marginTop: isTablet ? 20 : 16,
            marginBottom: isTablet ? 4 : 0,
        },

        rowContent: {
            flex: 1,
            paddingRight: isTablet ? 20 : 12,
        },

        name: {
            fontSize: isTablet ? 22 : 20,
            fontWeight: "700",
            color: "#111827",
        },

        rowTitle: {
            fontSize: isTablet ? 18 : 17,
            fontWeight: "600",
            color: "#111827",
        },

        subtitle: {
            color: "#6B7280",
            fontSize: isTablet ? 15 : 14,
            lineHeight: isTablet ? 21 : undefined,
            marginTop: 4,
        },

        logoutButton: {
            marginTop: isTablet ? 40 : 30,
            height: isTablet ? 62 : 54,
            borderRadius: isTablet ? 16 : 14,
            borderWidth: 1,
            borderColor: "#EF4444",
            justifyContent: "center",
            alignItems: "center",
        },

        logoutText: {
            color: "#EF4444",
            fontWeight: "600",
            fontSize: isTablet ? 17 : 16,
        },

        version: {
            textAlign: "center",
            marginTop: isTablet ? 15 : 24,
            color: "#9CA3AF",
            fontSize: isTablet ? 14 : 13,
        },
    });