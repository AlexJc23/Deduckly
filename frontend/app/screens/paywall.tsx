import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  Text,
  Pressable,
  ScrollView,
} from "react-native";

import { Image } from "react-native";

const FEATURES = [
  "📊 Advanced business reports",
  "💰 Profit & tax insights",
  "🎯 Income goals & progress",
  "☁️ Future premium features",
  "🚀 Priority updates",
];

export default function PaywallScreen() {
  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: "#ffffff",
      }}
    >
      <ScrollView
        contentContainerStyle={{
          padding: 24,
          flexGrow: 1,
        }}
      >
        {/* Header */}
        <View
          style={{
            alignItems: "center",
            marginTop: 40,
          }}
        >
          <View
            
          >
            <Image
            source={require("../../assets/images/logofrenchblue.png")}
            style={{
                width: 100,
                height: 100,
            }}
            />
          </View>

          <Text
            style={{
              fontSize: 34,
              fontWeight: "800",
              color: "#111827",
            }}
          >
            Deduckly Pro
          </Text>

          <Text
            style={{
              marginTop: 12,
              textAlign: "center",
              color: "#6B7280",
              fontSize: 16,
              lineHeight: 24,
            }}
          >
            Unlock powerful tools to help you keep more of what you earn.
          </Text>
        </View>

        {/* Features */}
        <View
          style={{
            marginTop: 36,
            backgroundColor: "white",
            borderRadius: 20,
            padding: 20,
          }}
        >
          {FEATURES.map((feature) => (
            <View
              key={feature}
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 18,
              }}
            >
              <Text
                style={{
                  fontSize: 18,
                  marginRight: 12,
                }}
              >
                ✓
              </Text>

              <Text
                style={{
                  flex: 1,
                  fontSize: 16,
                  color: "#111827",
                }}
              >
                {feature}
              </Text>
            </View>
          ))}
        </View>

        {/* Pricing */}
        <View
          style={{
            marginTop: 28,
            alignItems: "center",
          }}
        >
          <Text
            style={{
              fontSize: 18,
              color: "#6B7280",
            }}
          >
            Starting at
          </Text>

          <Text
            style={{
              fontSize: 44,
              fontWeight: "800",
              color: "#111827",
              marginTop: 8,
            }}
          >
            $3.99
            <Text
              style={{
                fontSize: 18,
                color: "#6B7280",
              }}
            >
              /month
            </Text>
          </Text>

          <Text
            style={{
              marginTop: 8,
              color: "#6B7280",
            }}
          >
            Cancel anytime.
          </Text>
        </View>

        <View style={{ flex: 1 }} />

        {/* Subscribe Button */}
        <Pressable
          style={{
            backgroundColor: "#3F6EE8",
            paddingVertical: 18,
            borderRadius: 16,
            alignItems: "center",
            marginTop: 40,
          }}
        >
          <Text
            style={{
              color: "white",
              fontWeight: "700",
              fontSize: 18,
            }}
          >
            Start Free Trial
          </Text>
        </Pressable>

        <Pressable
          style={{
            marginTop: 18,
            alignItems: "center",
          }}
        >
          <Text
            style={{
              color: "#6B7280",
              fontSize: 15,
            }}
          >
            Restore Purchases
          </Text>
        </Pressable>

        <Text
          style={{
            marginTop: 20,
            textAlign: "center",
            color: "#9CA3AF",
            fontSize: 12,
            lineHeight: 18,
          }}
        >
          Payment will be charged to your Apple Account. Subscription
          automatically renews unless canceled at least 24 hours before the end
          of the current period.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}