import { router, useLocalSearchParams } from "expo-router";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
} from "react-native";
import { useState } from "react";

import { BackHeader } from "@/components/ui/BackButton";
import { useSubmitFeedback } from "@/features/feedback/hooks/use-submit-feedback";
import { getFeedbackMetadata } from "@/features/feedback/utils/feedback-metadata";

export default function FeedbackFormScreen() {
  const { type } = useLocalSearchParams<{
    type: "bug" | "feature" | "general";
  }>();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const submitFeedback = useSubmitFeedback();

  const metadata = getFeedbackMetadata();


  const screen = {
    bug: {
      title: "Report a Bug",
      subtitle:
        "Tell us what happened and we'll investigate it.",
      titlePlaceholder: "What went wrong?",
      descriptionPlaceholder:
        "Describe what happened, what you expected, and how to reproduce it.",
    },

    feature: {
      title: "Request a Feature",
      subtitle:
        "Have an idea that would improve Deduckly?",
      titlePlaceholder: "Feature idea",
      descriptionPlaceholder:
        "Describe your idea and how it would help.",
    },

    general: {
      title: "General Feedback",
      subtitle:
        "We'd love to hear what you think.",
      titlePlaceholder: "What's on your mind?",
      descriptionPlaceholder:
        "Tell us anything you'd like us to know.",
    },
  }[type ?? "general"];

  async function handleSubmit() {
    const trimmedTitle = title.trim();
    const trimmedDescription =
      description.trim();

    if (!trimmedTitle) {
      return;
    }

    if (!trimmedDescription) {
      return;
    }
    console.log(metadata);

    try {
      await submitFeedback.mutateAsync({
        type: (type ??
          "general") as
          | "bug"
          | "feature"
          | "general",

        title: trimmedTitle,

        description:
          trimmedDescription,

        ...metadata,
      });
      router.back();
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={
        Platform.OS === "ios"
          ? "padding"
          : undefined
      }
    >
      <BackHeader />

      <ScrollView
        contentContainerStyle={
          styles.container
        }
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>
          {screen.title}
        </Text>

        <Text style={styles.subtitle}>
          {screen.subtitle}
        </Text>

        <Text style={styles.label}>
          Title
        </Text>

        <TextInput
          style={styles.input}
          placeholder={
            screen.titlePlaceholder
          }
          value={title}
          onChangeText={setTitle}
          returnKeyType="next"
        />

        <Text style={styles.label}>
          Description
        </Text>

        <TextInput
          style={styles.description}
          placeholder={
            screen.descriptionPlaceholder
          }
          multiline
          textAlignVertical="top"
          value={description}
          onChangeText={
            setDescription
          }
        />

        <Pressable
          style={[
            styles.button,
            submitFeedback.isPending &&
              styles.buttonDisabled,
          ]}
          disabled={
            submitFeedback.isPending
          }
          onPress={handleSubmit}
        >
          <Text
            style={
              styles.buttonText
            }
          >
            {submitFeedback.isPending
              ? "Submitting..."
              : "Submit Feedback"}
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles =
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor:
        "#F8FAFC",
    },

    container: {
      padding: 20,
      paddingBottom: 40,
    },

    title: {
      fontSize: 30,
      fontWeight: "700",
      color: "#111827",
      marginBottom: 6,
    },

    subtitle: {
      color: "#6B7280",
      fontSize: 15,
      marginBottom: 28,
      lineHeight: 22,
    },

    label: {
      fontSize: 15,
      fontWeight: "600",
      color: "#111827",
      marginBottom: 8,
      marginTop: 8,
    },

    input: {
      backgroundColor:
        "#FFFFFF",
      borderRadius: 14,
      paddingHorizontal: 16,
      height: 52,
      fontSize: 16,
      marginBottom: 16,
    },

    description: {
      backgroundColor:
        "#FFFFFF",
      borderRadius: 14,
      padding: 16,
      minHeight: 180,
      fontSize: 16,
      marginBottom: 24,
    },

    button: {
      backgroundColor:
        "#2DBE60",
      height: 56,
      borderRadius: 16,
      justifyContent:
        "center",
      alignItems: "center",
    },

    buttonDisabled: {
      opacity: 0.6,
    },

    buttonText: {
      color: "#FFFFFF",
      fontWeight: "700",
      fontSize: 16,
    },
  });