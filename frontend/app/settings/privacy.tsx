import { BackHeader } from "@/components/ui/BackButton";
import { View, Text, Pressable } from "react-native";
import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import DeleteAccountModal from "@/features/settings/modals/DeleteAccountModal";
import { clearTokens } from "@/features/auth/services/auth-service.service";
import { useDeleteUser } from "@/features/auth/hooks/use-delete-account";
import { router } from "expo-router"
import React from "react"

export default function PrivacyScreen() {
    const deleteUserMutation = useDeleteUser();
    const queryClient = useQueryClient();

      
    const [showDeleteModal, setShowDeleteModal] =
      useState(false);

    return (
        <View>
                    <BackHeader />
                    <View>
                        <>
                        <Pressable onPress={() => router.push("/settings/privacy/sections/privacy-policy")}>
                            <Text>
                                Privacy Policy
                            </Text>
                            <Text>
                                Read our policy to understand
                                how we collect, use and protect
                                your data,
                            </Text>
                        </Pressable>
                        </>
                        <>
                        <Pressable
                            onPress={() => {
                                setShowDeleteModal(true);
                            }}
                        >
                            <Text>Delete Account</Text>
                        </Pressable>
                        </>
                        <>
                            <Text style={{ fontWeight: "700" }}>Your privacy matters</Text>
                            <Text>
                                We’re committed to keeping your data
                                safe and never sell your personal
                                information.
                            </Text>
                        </>
        
                    </View>
                    <DeleteAccountModal
                            visible={showDeleteModal}
                            onClose={() => setShowDeleteModal(false)}
                            onDelete={async () => {
                                await deleteUserMutation.mutateAsync();
                    
                                await clearTokens();
                    
                                queryClient.clear();
                    
                                router.replace("/login");
                            }}
                            />
                </View>
    );
}