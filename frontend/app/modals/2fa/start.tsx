import { Pressable, SafeAreaView, Text, View } from "@/theme/components";
import { StyleSheet, ViewStyle, TextStyle } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@/theme/icons";

export default function TwoFAStartScreen() {
  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <View style={styles.hero}>
            <View style={styles.iconContainer}>
              <View style={styles.iconInner}>
                <Ionicons
                  name="shield-checkmark"
                  size={30}
                  color="#4A6FE3"
                />
              </View>
            </View>

            <Text style={styles.eyebrow}>
              ACCOUNT SECURITY
            </Text>

            <Text style={styles.title}>
              Protect your account
            </Text>

            <Text style={styles.description}>
              Add an extra layer of security to your
              Deduckly account with two-factor
              authentication.
            </Text>
          </View>

          <View style={styles.stepsCard}>
            <Text style={styles.stepsHeading}>
              How it works
            </Text>

            <Text style={styles.stepsSubtitle}>
              Setup takes less than a minute.
            </Text>

            <View style={styles.steps}>
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
          </View>

          <View style={styles.actions}>
            <Pressable
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && styles.primaryButtonPressed,
              ]}
              onPress={() =>
                router.replace("/modals/2fa/scan")
              }
            >
              <Text style={styles.primaryText}>
                Continue
              </Text>

            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.cancelButton,
                pressed && styles.cancelButtonPressed,
              ]}
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
          <View style={styles.numberBadge}>
            <Text style={styles.stepNumber}>
              {number}
            </Text>
          </View>

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
  content: ViewStyle;
  hero: ViewStyle;
  iconContainer: ViewStyle;
  iconInner: ViewStyle;
  stepsCard: ViewStyle;
  steps: ViewStyle;
  step: ViewStyle;
  stepIcon: ViewStyle;
  stepContent: ViewStyle;
  stepTitleRow: ViewStyle;
  numberBadge: ViewStyle;
  connector: ViewStyle;
  actions: ViewStyle;
  primaryButton: ViewStyle;
  primaryButtonPressed: ViewStyle;
  arrowContainer: ViewStyle;
  cancelButton: ViewStyle;
  cancelButtonPressed: ViewStyle;

  eyebrow: TextStyle;
  title: TextStyle;
  description: TextStyle;
  stepsHeading: TextStyle;
  stepsSubtitle: TextStyle;
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

  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 18,
    justifyContent: "center",
  },

  hero: {
    alignItems: "center",
    marginBottom: 22,
  },

  iconContainer: {
    width: 76,
    height: 76,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E9EEFF",
    borderWidth: 1,
    borderColor: "#D8E1FF",
    marginBottom: 14,
  },

  iconInner: {
    width: 58,
    height: 58,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    shadowColor: "#4A6FE3",
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    elevation: 2,
  },

  eyebrow: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.5,
    color: "#7B8BA2",
    marginBottom: 6,
  },

  title: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "800",
    letterSpacing: -0.8,
    color: "#273449",
    textAlign: "center",
  },

  description: {
    maxWidth: 360,
    marginTop: 8,
    fontSize: 14,
    lineHeight: 21,
    color: "#64748B",
    textAlign: "center",
  },

  stepsCard: {
    width: "100%",
    maxWidth: 560,
    alignSelf: "center",
    padding: 20,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E3E8F0",

    shadowColor: "#0F172A",
    shadowOpacity: 0.045,
    shadowRadius: 14,
    shadowOffset: {
      width: 0,
      height: 5,
    },

    elevation: 2,
  },

  steps: {
    marginTop: 18,
  },

  stepsHeading: {
    fontSize: 16,
    fontWeight: "800",
    color: "#273449",
  },

  stepsSubtitle: {
    marginTop: 3,
    fontSize: 12,
    color: "#8A97A9",
  },

  step: {
    flexDirection: "row",
    alignItems: "flex-start",
  },

  stepIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F0F3FF",
    borderWidth: 1,
    borderColor: "#E0E7FF",
    marginRight: 13,
  },

  stepContent: {
    flex: 1,
    paddingTop: 1,
  },

  stepTitleRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  numberBadge: {
    width: 20,
    height: 20,
    borderRadius: 7,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EEF2FF",
    marginRight: 6,
  },

  stepNumber: {
    fontSize: 10,
    fontWeight: "800",
    color: "#4A6FE3",
  },

  stepTitle: {
    flex: 1,
    fontSize: 14,
    color: "#334155",
  },

  stepDescription: {
    marginTop: 4,
    fontSize: 12,
    lineHeight: 17,
    color: "#7A899D",
    paddingRight: 4,
  },

  connector: {
    width: 1,
    height: 13,
    backgroundColor: "#DCE2EB",
    marginLeft: 20,
    marginVertical: 7,
  },

  actions: {
    width: "100%",
    maxWidth: 560,
    alignSelf: "center",
    marginTop: 20,
  },

  primaryButton: {
    height: 54,
    borderRadius: 16,
    backgroundColor: "#4A6FE3",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,

    shadowColor: "#4A6FE3",
    shadowOpacity: 0.22,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 5,
    },

    elevation: 4,
  },

  primaryButtonPressed: {
    backgroundColor: "#3559C7",
    transform: [{ scale: 0.985 }],
  },

  arrowContainer: {
    width: 26,
    height: 26,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.16)",
  },

  primaryText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#FFFFFF",
  },

  cancelButton: {
    alignItems: "center",
    paddingVertical: 13,
    borderRadius: 12,
    marginTop: 2,
  },

  cancelButtonPressed: {
    backgroundColor: "#EEF2F6",
  },

  cancelText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#718096",
  },
});