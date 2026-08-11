import {
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  ViewStyle,
  TextStyle,
} from "react-native";
import { router } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";

export default function TwoFAStartScreen() {
  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            Two-Factor Authentication
          </Text>

          <Pressable
            style={styles.closeButton}
            onPress={() => router.back()}
            hitSlop={8}
          >
            <Ionicons
              name="close"
              size={20}
              color="#64748B"
            />
          </Pressable>
        </View>

        <View style={styles.content}>
          <View style={styles.hero}>
            <View style={styles.iconContainer}>
              <Ionicons
                name="shield-checkmark"
                size={30}
                color="#4A6FE3"
              />
            </View>

            <Text style={styles.eyebrow}>
              ACCOUNT SECURITY
            </Text>

            <Text style={styles.title}>
              Protect your account
            </Text>

            <Text style={styles.description}>
              Add an extra layer of security to
              your Deduckly account with
              two-factor authentication.
            </Text>
          </View>

          <View style={styles.stepsCard}>
            <Step
              number="1"
              icon="qr-code-outline"
              title="Scan the QR code"
              description="Use an authenticator app to scan the setup code."
            />

            <View style={styles.connector} />

            <Step
              number="2"
              icon="keypad-outline"
              title="Verify your code"
              description="Enter the six-digit code from your authenticator app."
            />

            <View style={styles.connector} />

            <Step
              number="3"
              icon="shield-checkmark-outline"
              title="You're protected"
              description="You'll use your authenticator when signing in."
            />
          </View>

          <View style={styles.actions}>
            <Pressable
              style={styles.primaryButton}
              onPress={() =>
                router.push("/modals/2fa/scan")
              }
            >
              <Text style={styles.primaryText}>
                Continue
              </Text>

              <Ionicons
                name="arrow-forward"
                size={18}
                color="#FFFFFF"
              />
            </Pressable>

            <Pressable
              style={styles.cancelButton}
              onPress={() => router.back()}
            >
              <Text style={styles.cancelText}>
                Not Now
              </Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

function Step({
  number,
  icon,
  title,
  description,
}: {
  number: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
}) {
  return (
    <View style={styles.step}>
      <View style={styles.stepIcon}>
        <Ionicons
          name={icon}
          size={18}
          color="#4A6FE3"
        />
      </View>

      <View style={styles.stepContent}>
        <View style={styles.stepTitleRow}>
          <Text style={styles.stepNumber}>
            {number}
          </Text>

          <Text style={styles.stepTitle}>
            {title}
          </Text>
        </View>

        <Text style={styles.stepDescription}>
          {description}
        </Text>
      </View>
    </View>
  );
}

type Styles = {
  screen: ViewStyle;
  safeArea: ViewStyle;
  header: ViewStyle;
  closeButton: ViewStyle;
  content: ViewStyle;
  hero: ViewStyle;
  iconContainer: ViewStyle;
  stepsCard: ViewStyle;
  step: ViewStyle;
  stepIcon: ViewStyle;
  stepContent: ViewStyle;
  stepTitleRow: ViewStyle;
  connector: ViewStyle;
  actions: ViewStyle;
  primaryButton: ViewStyle;
  cancelButton: ViewStyle;

  headerTitle: TextStyle;
  eyebrow: TextStyle;
  title: TextStyle;
  description: TextStyle;
  stepNumber: TextStyle;
  stepTitle: TextStyle;
  stepDescription: TextStyle;
  primaryText: TextStyle;
  cancelText: TextStyle;
};

const styles = StyleSheet.create<Styles>({
  screen: {
    flex: 1,
    backgroundColor: "#F7F9FC",
  },

  safeArea: {
    flex: 1,
  },

  header: {
    height: 58,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#E8ECF2",
    backgroundColor: "#F7F9FC",
  },

  headerTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#334155",
  },

  closeButton: {
    width: 34,
    height: 34,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EEF1F5",
  },

  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 26,
    paddingBottom: 20,
  },

  hero: {
    alignItems: "center",
  },

  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EEF2FF",
    borderWidth: 1,
    borderColor: "#DCE5FF",
    marginBottom: 15,
  },

  eyebrow: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.4,
    color: "#8A9BB3",
    marginBottom: 6,
  },

  title: {
    fontSize: 26,
    lineHeight: 31,
    fontWeight: "800",
    letterSpacing: -0.7,
    color: "#273449",
    textAlign: "center",
  },

  description: {
    maxWidth: 330,
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
    color: "#64748B",
    textAlign: "center",
  },

  stepsCard: {
    marginTop: 24,
    padding: 18,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E3E8F0",
  },

  step: {
    flexDirection: "row",
    alignItems: "flex-start",
  },

  stepIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F0F3FF",
    borderWidth: 1,
    borderColor: "#E0E7FF",
    marginRight: 12,
  },

  stepContent: {
    flex: 1,
    paddingTop: 1,
  },

  stepTitleRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  stepNumber: {
    width: 18,
    fontSize: 11,
    fontWeight: "800",
    color: "#91A0B5",
    marginRight: 3,
  },

  stepTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#334155",
  },

  stepDescription: {
    marginTop: 3,
    fontSize: 12,
    lineHeight: 17,
    color: "#7A899D",
    paddingRight: 4,
  },

  connector: {
    width: 1,
    height: 12,
    backgroundColor: "#E3E8F0",
    marginLeft: 19,
    marginVertical: 6,
  },

  actions: {
    marginTop: 22,
  },

  primaryButton: {
    height: 52,
    borderRadius: 15,
    backgroundColor: "#4A6FE3",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    shadowColor: "#4A6FE3",
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    elevation: 3,
  },

  primaryText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#FFFFFF",
  },

  cancelButton: {
    alignItems: "center",
    paddingVertical: 14,
  },

  cancelText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#718096",
  },
});