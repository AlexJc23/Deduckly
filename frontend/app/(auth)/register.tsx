
import { View, Text, TextInput, Button, Alert, Modal, Pressable } from "react-native";

import { useMutation } from "@tanstack/react-query";
import { saveTokens } from "@/features/auth/services/auth-service.service"
import { register } from "@/features/auth/api/auth.api";
import { useAuth } from "@/features/auth/context/auth.context";
import { useState } from "react";
import { router, Link } from "expo-router";



export default function RegisterScreen() {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const passwordsMatch = password === confirmPassword;
    const [filingStatus, setFilingStatus] = useState("");
    const [showFilingStatusModal, setShowFilingStatusModal] = useState(false);
    const [error, setError] = useState("");

    const filingStatuses = [
        { label: "Single", value: "single" },
        { label: "Married Filing Jointly", value: "married_filing_jointly" },
        { label: "Married Filing Separately", value: "married_filing_separately" },
        { label: "Head of Household", value: "head_of_household" }
    ];


    const { signIn } = useAuth();


    const registerMutation = useMutation({
        mutationFn: register,

        onSuccess: async (data) => {
        await saveTokens(
            data.access_token,
            data.refresh_token
        );

        signIn();

        router.replace("/(tabs)/dashboard");
        },
        onError: (error) => {
            console.error("Registration failed:", error);
            Alert.alert(
                "Registration Failed",
                "An error occurred during registration. Please try again."
            );
        }
    });

    return (
        <View
            style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                padding: 24
            }}
        >
            <Text>First Name</Text>
            <TextInput
                value={firstName}
                onChangeText={setFirstName}
                placeholder="John"
                style={{
                    borderWidth: 1,
                    padding: 12,
                    marginBottom: 16
                }}
            />
            <Text>Last Name</Text>
            <TextInput
                value={lastName}
                onChangeText={setLastName}
                placeholder="Doe"
                style={{
                    borderWidth: 1,
                    padding: 12,
                    marginBottom: 16
                }}
            />
            <Text>Email</Text>
            <TextInput
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                placeholder="example@gmail.com"
                style={{
                    borderWidth: 1,
                    padding: 12,
                    marginBottom: 16
                }}
            />
            <Text>Password</Text>
            <TextInput
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                placeholder="••••••••"
                style={{
                    borderWidth: 1,
                    padding: 12,
                    marginBottom: 16
                }}
            />
            <Text>Confirm Password</Text>
            <TextInput
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                placeholder="••••••••"
                style={{
                    borderWidth: 1,
                    padding: 12,
                    marginBottom: 16
                }}
            />
            {!passwordsMatch && (
                <Text style={{ color: "red", marginBottom: 16 }}>
                    Passwords do not match
                </Text>
            )}
            <Text>Filing Status</Text>
            <Pressable
                onPress={() => setShowFilingStatusModal(true)}
                style={{
                    borderWidth: 1,
                    padding: 12,
                    marginBottom: 16,
                    width: "100%",
                    alignItems: "center"
                }}
            >
                <Text>{filingStatuses.find(status => status.value === filingStatus)?.label || "Select Filing Status"}</Text>
            </Pressable>

            <Button
                disabled={!passwordsMatch}
                title="Register"
                onPress={() => registerMutation.mutate({ first_name: firstName, last_name: lastName, email, password, filing_status: filingStatus })}
            />

            <Text style={{ marginTop: 16 }}>
                Already have an account?{" "}
                <Link
                    href="/(auth)/login"
                    style={{ marginTop: 16, color: "blue" }}
                    >
                Sign In
                </Link>
            </Text>
            <Modal
    visible={showFilingStatusModal}
    transparent
    animationType="fade"
    onRequestClose={() =>
        setShowFilingStatusModal(false)
    }
>
    <View
        style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0,0,0,0.5)",
        }}
    >
        <View
            style={{
                width: "80%",
                backgroundColor: "white",
                borderRadius: 12,
                padding: 20,
            }}
        >
            <Text
                style={{
                    fontSize: 18,
                    fontWeight: "600",
                    marginBottom: 16,
                }}
            >
                Choose Filing Status
            </Text>

            {filingStatuses.map((status) => (
                <Pressable
                    key={status.value}
                    style={{
                        paddingVertical: 12,
                    }}
                    onPress={() => {
                        setFilingStatus(status.value);
                        setShowFilingStatusModal(false);
                    }}
                >
                    <Text>{status.label}</Text>
                </Pressable>
            ))}

            <Pressable
                onPress={() =>
                    setShowFilingStatusModal(false)
                }
            >
                <Text
                    style={{
                        textAlign: "center",
                        marginTop: 16,
                    }}
                >
                    Cancel
                </Text>
            </Pressable>
        </View>
    </View>
</Modal>
        </View>
    );
}
