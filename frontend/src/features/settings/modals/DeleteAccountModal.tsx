import { localizedAlert } from "@/i18n/alerts";
import { useLanguage, Translated } from "@/i18n/language";
import { ScrollView, Text, TextInput, Pressable, AnimatedView } from "@/theme/components";
import { Modal, Animated, Easing, StyleSheet, KeyboardAvoidingView, Platform } from "react-native";
import { useEffect, useRef, useState } from "react";

type DeleteAccountModalProps = {
  visible: boolean;
  onClose: () => void;
  onDelete: () => Promise<void>;
};

export default function DeleteAccountModal({
  visible,
  onClose,
  onDelete,
}: DeleteAccountModalProps) {
  useLanguage();
  const [deleting, setDeleting] = useState(false);
  const deleteLock = useRef(false);
  async function confirmDelete() {
    if (deleteLock.current) return;
    deleteLock.current = true; setDeleting(true);
    try { await onDelete(); }
    catch { localizedAlert("Account couldn’t be deleted", "Please try again. If you use Sign in with Apple, we also need to disconnect it before deleting your account."); }
    finally { deleteLock.current = false; setDeleting(false); }
  }
  const [isMounted, setIsMounted] = useState(visible);
  const [confirmation, setConfirmation] = useState("");

  const translateY = useRef(
    new Animated.Value(420)
  ).current;

  useEffect(() => {
    if (visible) {
      setIsMounted(true);

      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(translateY, {
        toValue: 420,
        duration: 300,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }).start(() => {
        setIsMounted(false);
        setConfirmation("");
      });
    }
  }, [visible, translateY]);

  const canDelete =
    confirmation === "DELETE";

  return (
    <Modal
      visible={isMounted}
      transparent
      animationType="none"
    >
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{
          flex: 1,
          justifyContent: "flex-end",
        }}
      >
        <Pressable
          style={{
            ...StyleSheet.absoluteFillObject,
            backgroundColor:
              "rgba(0,0,0,0.5)",
          }}
          onPress={onClose} disabled={deleting}
        />

        <AnimatedView
          style={{
            transform: [{ translateY }],
            backgroundColor: "white",
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            maxHeight: "90%",
            width: "100%", maxWidth: 560, alignSelf: "center",
          }}
        >
          <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: 24 }}>
          <Text
            style={{
              fontSize: 22,
              fontWeight: "600",
              marginBottom: 16,
            }}
          >
            <Translated text={"Delete Account"} /></Text>

          <Text
            style={{
              marginBottom: 24,
            }}
          >
            <Translated text={"This action cannot be undone. Your Deduckly account, trips, expenses, and income records will be permanently deleted. Apple subscriptions are not canceled when you delete your account. Manage or cancel your subscription in your Apple Account settings."} /></Text>

          <TextInput
            placeholder="Type DELETE"
            editable={!deleting}
            value={confirmation}
            onChangeText={setConfirmation}
            autoCapitalize="characters"
            style={{
              borderWidth: 1,
              borderColor: "#DDD",
              borderRadius: 12,
              padding: 14,
              marginBottom: 24,
            }}
          />

          <Pressable
            disabled={!canDelete || deleting}
            onPress={confirmDelete}
            style={{
              backgroundColor: canDelete
                ? "#FF3B30"
                : "#C7C7CC",
              padding: 16,
              borderRadius: 12,
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <Text
              style={{
                color: "white",
                fontWeight: "600",
              }}
            >
              <Translated text={"Delete Account"} /></Text>
          </Pressable>

          <Pressable
            onPress={onClose} disabled={deleting}
            style={{
              alignItems: "center",
              padding: 12,
            }}
          >
            <Text><Translated text={"Cancel"} /></Text>
          </Pressable>
          </ScrollView>
        </AnimatedView>
      </KeyboardAvoidingView>
    </Modal>
  );
}