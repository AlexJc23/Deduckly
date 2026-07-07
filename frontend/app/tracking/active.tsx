
import { View, Text, Button, Pressable } from "react-native";
import { router } from 'expo-router'
import { useState, useEffect } from "react";
import { EndTripModal } from "@/features/tracking/components/EndTripModal";
import { useTracking } from "@/features/tracking/context/tracking.context";
import { getCurrentLocation, requestLocationPermission } from "@/features/tracking/services/location.service";
import { IncomeModal } from "@/features/tracking/components/IncomeModal";
import { CancelTripModal } from "@/features/trips/components/CancelTripModal";


function formatTime(seconds: number) {
  const hours = Math.floor(
    seconds / 3600
  );

  const minutes = Math.floor(
    (seconds % 3600) / 60
  );

  const remainingSeconds =
    seconds % 60;

  return `${hours
    .toString()
    .padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${remainingSeconds
    .toString()
    .padStart(2, "0")}`;
}

export default function ActiveTripScreen() {
    const [showEndModal, setShowEndModal] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [elapsedSeconds, setElapsedSeconds] = useState(0)
    const {category, platform, startTime, distanceMiles, stopTracking, cancelTracking} = useTracking();
    const [showIncomeModal, setShowIncomeModal] = useState(false);

    useEffect(() => {
        if (!startTime) return;

        const interval = setInterval(() => {
            const seconds = Math.floor(
                (Date.now() - startTime.getTime()) / 1000
            );

            setElapsedSeconds(seconds)
        }, 1000);

        return () => clearInterval(interval);
    }, [startTime])



  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        marginTop: "75%"

      }}
    >
        <Button title="Back"
        onPress={() => router.back()}

        />
      <Text>Active Trip</Text>
      <View>
        <Text>
            Duration
        </Text>
        <Text>
            {formatTime(elapsedSeconds)}
        </Text>
        <Text>
            hh:mm:ss
        </Text>
      </View>
      <View>
        <Text>
            Distance
        </Text>
        <Text>
            {distanceMiles.toFixed(2)} mi
        </Text>
        <Text>
            miles tracked
        </Text>
        <>
            <Text>{platform}</Text>
        </>
      </View>


      <View>
        <Pressable
            onPress={() => setShowEndModal(true)}
            >
            <Text>Stop Trip</Text>
            <Text>End and Save Trip</Text>
        </Pressable>
        <Pressable onPress={() => setShowCancelModal(true)}>
          <Text>Cancel Trip</Text>
        </Pressable>
      </View>
      <CancelTripModal
      visible={showCancelModal}
      onClose={() => {
        setShowCancelModal(false)
      }}
      onCancel={() => {
        setShowCancelModal(false);
        cancelTracking();

        router.push({
          pathname: '/(tabs)/dashboard',
          params: {
            discarded: "true",
          },
        });
      }}
      />
      <EndTripModal
        visible={showEndModal}
        onClose={() => {
          setShowEndModal(false)
        }}
        onConfirm={() => {
          setShowEndModal(false);

          setTimeout(() => {
            setShowIncomeModal(true);
          }, 350);
        }}
      />
      <IncomeModal
        visible={showIncomeModal}
        onSave={async (income) => {
          setShowIncomeModal(false);

          const result =await stopTracking(income);

          if (result === true) {
            router.replace({
              pathname: "/(tabs)/dashboard",
              params: { saved: "true" },
            });
          }

          if (result === "discarded") {
            router.replace({
              pathname: "/(tabs)/dashboard",
              params: { discarded: "true" },
            });
          }
        }}
        onSkip={async () => {
          setShowIncomeModal(false);

          const result = await stopTracking(null);

          if (result === true) {
            router.replace({
              pathname: "/(tabs)/dashboard",
              params: { saved: "true" },
            });
          }

          if (result === "discarded") {
            router.replace({
              pathname: "/(tabs)/dashboard",
              params: { discarded: "true" },
            });
          }
        }}
      />

    </View>
  );
}
