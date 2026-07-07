import { useEffect, useState, useRef, useCallback } from "react";
import { View, Text, Button, SafeAreaView, Pressable } from "react-native";
import { useCurrentUser } from "@/features/auth/hooks/use-current-user";
import { router, useLocalSearchParams } from "expo-router";
import { StartTripModal } from "@/features/tracking/components/StartTripModal";
import { useTracking } from "@/features/tracking/context/tracking.context";

export default function DashboardScreen() {
  const userQuery = useCurrentUser();

  const [showStartTripModal, setShowStartTripModal] = useState(false)
  const { isTracking } = useTracking();
  const { saved } = useLocalSearchParams();

  const [showBanner, setShowBanner ] = useState(false)
  const hideBannerTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (saved === "true") {
      setShowBanner(true);
      if (hideBannerTimeout.current) clearTimeout(hideBannerTimeout.current);
      hideBannerTimeout.current = setTimeout(() => {
        setShowBanner(false);
        hideBannerTimeout.current = null;
      }, 3000);
    }

    return () => {
      if (hideBannerTimeout.current) clearTimeout(hideBannerTimeout.current);
    };
  }, [saved]);

  const openStartModal = useCallback(() => setShowStartTripModal(true), []);
  const closeStartModal = useCallback(() => setShowStartTripModal(false), []);

  return (
    <SafeAreaView
      style={{
        flex: 1,
        padding: 20,
        backgroundColor: "#FFF",
      }}
    >
      {
        showBanner && (
          <View
            style={{
              position: "absolute",
              top: 60,
              left: 16,
              right: 16,
              backgroundColor: "#34C759",
              padding: 12,
              borderRadius: 12,
              zIndex: 1000,
            }}
          >
            <Text
              style={{
                color: "white",
                fontWeight: "600",
                textAlign: "center",
              }}
            >
              Trip Saved Successfully
            </Text>
          </View>
        )
      }
      {userQuery.data && (
        <Text
          style={{
            left: 26,
            fontSize: 22,
            fontWeight: "700",
            marginTop: "5%",
            marginBottom: 24,
        }}
        >
          Welcome back, {userQuery.data.first_name}!
        </Text>
      )}

      <View
        style={{
          width: "90%",
          backgroundColor: "#fff",
          borderRadius: 12,
          borderWidth: 1,
          borderColor: "#E5E7EB",
          padding: 18,
          alignSelf: "center"
        }}
      >
        <Text
          style={{
            fontSize: 30,
            fontWeight: "700",
          }}
        >
          $842
        </Text>

        <Text
          style={{
            color: "#6B7280",
            marginTop: 4,
          }}
        >
          Estimated taxes
          (not fun... we know)
        </Text>

        <View
          style={{
            marginTop: 18,
          }}
        >
          <Text
            style={{
              fontSize: 26,
              fontWeight: "700",
            }}
          >
            $124 cut so far
          </Text>

        </View>
      </View>
      <View
        style={{
          flexDirection: "row",
          marginTop: 12,
          gap:12,
          width: "90%",
          alignSelf: 'center'
        }}
      >
            <View
            style={{
              flex: 1,
              backgroundColor: "#FFF",
              borderRadius: 12,
              borderWidth: 1,
              borderColor: "#E5E7EB",
              padding: 16,
            }}
            >
              <Text>
                {12.9} miles today
              </Text>
            </View>
            <View
            style={{
              flex: 1,
              backgroundColor: "#FFF",
              borderRadius: 12,
              borderWidth: 1,
              borderColor: "#E5E7EB",
              padding: 16,
            }}
            >
              <Text>
                ${22} expenses
              </Text>
            </View>

      </View>

      <View
        style={{
          width: "90%",
          alignSelf: "center",
          margin: 10,
        }}
      >
        <Text
        style={{

        }}

        >
          Activity
        </Text>
        <View
          style={{
            paddingVertical: 16,
            borderBottomWidth: 1,
            borderBottomColor: "#E5E7EB",
          }}
        >
          <Text
            style={{
              fontSize: 18,
              fontWeight: "600",
            }}
          >
            $17.93
          </Text>

          <Text
            style={{
              color: "#6B7280",
              marginTop: 4,
            }}
          >
            +$39 • Aug 21
          </Text>
        </View>
        <View
          style={{
            paddingVertical: 16,
            borderBottomWidth: 1,
            borderBottomColor: "#E5E7EB",
          }}
        >
          <Text
            style={{
              fontSize: 18,
              fontWeight: "600",
            }}
          >
            $17.93
          </Text>

          <Text
            style={{
              color: "#6B7280",
              marginTop: 4,
            }}
          >
            +$39 • Aug 21
          </Text>
        </View>


      </View>

      <View
        style={{
          marginBottom: 30,
          marginTop: "auto"
        }}
      >

      <View
        style={{
          flexDirection: "row",
          gap: 12,
          width: "90%",
          alignSelf: 'center',
        }}
        >
        <View
          style={{
            flex: 1,
            padding: 18,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: "#E5E7EB",
            alignItems: "center",
          }}
          >
          <Text
            style={{
              fontWeight: "600",
            }}
            >
            Add Income
          </Text>
        </View>

        <View
          style={{
            flex: 1,
            padding: 18,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: "#E5E7EB",
            alignItems: "center",
          }}
          >
          <Text
            style={{
              fontWeight: "600",
            }}
            >
            Add Expense
          </Text>
        </View>
      </View>

      <View>
          <Pressable
      onPress={!isTracking ? openStartModal : () => router.push("/tracking/active")}
      style={{
        marginTop: 20,
        marginBottom: "auto",
        width: "90%",
        alignSelf: "center",
        backgroundColor: isTracking ? "#D1D5DB" : "#22C55E",
        borderRadius: 30,
        paddingVertical: 18,
        alignItems: "center",
      }}
      >
      <Text
        style={{
          color: isTracking ? "#ffffff" : "#000",
          fontSize: 18,
          fontWeight: "600",
          margin: 20,
        }}
        >
        {isTracking ? "Trip in Progress" : "Start Trip"}
      </Text>
    </Pressable>
      </View>

      </View>
      <StartTripModal
        visible={showStartTripModal}
        onClose={closeStartModal}
        />
    </SafeAreaView>
  );
}
