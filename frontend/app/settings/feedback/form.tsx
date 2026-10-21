import { useAppTheme } from '@/theme/theme';
import { NAVY } from '@/theme/palette';
import { useLanguage, Translated } from "@/i18n/language";
import { Pressable, ScrollView, Text, TextInput } from "@/theme/components";
import { router, useLocalSearchParams } from "expo-router";
import { KeyboardAvoidingView, Platform, StyleSheet } from "react-native";
import { useState } from "react";

import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { useSubmitFeedback } from "@/features/feedback/hooks/use-submit-feedback";
import { getFeedbackMetadata } from "@/features/feedback/utils/feedback-metadata";

export default function FeedbackFormScreen() {
  const {t}=useLanguage();
  const {dark}=useAppTheme();
  const styles=getStyles(dark);
  const [error,setError]=useState('');
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
  }[type === "bug" || type === "feature" ? type : "general"];

  async function handleSubmit() {
    if(submitFeedback.isPending)return;
    setError('');
    const trimmedTitle = title.trim();
    const trimmedDescription =
      description.trim();

    if (!trimmedTitle) {
      setError('Enter a title for your feedback.');return;
    }

    if (!trimmedDescription) {
      setError('Add a description before submitting.');return;
    }


    try {
      await submitFeedback.mutateAsync({
        type: type === "bug" || type === "feature" ? type : "general",

        title: trimmedTitle,

        description:
          trimmedDescription,

        ...metadata,
      });
      router.back();
    } catch {
      setError('Feedback could not be sent. Your message is still here; try again.');
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
      <ScreenHeader title={screen.title} />

      <ScrollView
        contentContainerStyle={
          styles.container
        }
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>
          {<Translated text={screen.title} />}
        </Text>

        <Text style={styles.subtitle}>
          {t(screen.subtitle)}
        </Text>

        <Text style={styles.label}>
          <Translated text={"Title"} /></Text>

        <TextInput
          style={styles.input}
          placeholder={
            screen.titlePlaceholder
          }
          accessibilityLabel={t('Title')}
          placeholderTextColor={dark?NAVY.muted:'#64748B'}
          value={title}
          onChangeText={setTitle}
          returnKeyType="next"
        />

        <Text style={styles.label}>
          <Translated text={"Description"} /></Text>

        <TextInput
          style={styles.description}
          placeholder={
            screen.descriptionPlaceholder
          }
          accessibilityLabel={t('Description')}
          placeholderTextColor={dark?NAVY.muted:'#64748B'}
          multiline
          textAlignVertical="top"
          value={description}
          onChangeText={
            setDescription
          }
        />

        {!!error&&<Text accessibilityRole="alert" style={styles.error}>{t(error)}</Text>}
        <Pressable
          accessibilityRole="button"
          accessibilityState={{busy:submitFeedback.isPending,disabled:submitFeedback.isPending}}
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
              ? <Translated text={"Submitting..."} />
              : <Translated text={"Submit Feedback"} />}
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const getStyles = (dark:boolean)=>
  StyleSheet.create({
    error:{color:dark?NAVY.danger:'#B91C1C',fontSize:14,lineHeight:20,marginBottom:12},
    screen: {
      flex: 1,
      backgroundColor:
        dark?NAVY.background:"#F8FAFC",
    },

    container: {
      width:"100%",maxWidth:720,alignSelf:"center",
      padding: 20,
      paddingBottom: 40,
    },

    title: {
      fontSize: 30,
      fontWeight: "700",
      color:dark?NAVY.text:"#273449",
      marginBottom: 6,
    },

    subtitle: {
      color:dark?NAVY.muted:"#64748B",
      fontSize: 15,
      marginBottom: 28,
      lineHeight: 22,
    },

    label: {
      fontSize: 15,
      fontWeight: "600",
      color:dark?NAVY.text:"#273449",
      marginBottom: 8,
      marginTop: 8,
    },

    input: {
      backgroundColor:
        dark?NAVY.card:"#FFFFFF",
      borderRadius: 14,
      paddingHorizontal: 16,
      minHeight: 52,
      paddingVertical:12,
      color:dark?NAVY.text:"#273449",
      fontSize: 16,
      marginBottom: 16,
    },

    description: {
      backgroundColor:
        dark?NAVY.card:"#FFFFFF",
      borderRadius: 14,
      padding: 16,
      minHeight: 160,
      color:dark?NAVY.text:"#273449",
      fontSize: 16,
      marginBottom: 24,
    },

    button: {
      backgroundColor:
        NAVY.blue,
      minHeight: 56,
      padding:14,
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