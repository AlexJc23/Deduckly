import { View, Text, TextInput, Button, Alert } from "react-native";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";

import { login } from "@/features/auth/api/auth.api";
import { saveTokens } from "@/features/auth/services/auth-service.service"
import { useAuth } from "@/features/auth/context/auth.context";
import { router, Link } from "expo-router";



export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const { signIn } = useAuth();

    const loginMutation = useMutation({
        mutationFn: login,

        onSuccess: async (data) => {
            await saveTokens(
                data.access_token,
                data.refresh_token
            );
            signIn();

            router.replace("/(tabs)/dashboard");
        },

        onError: (error) => {
            console.log("Login failed:", error);
            Alert.alert(
                "Login Failed",
                "Please check your email and password."
            )
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
                placeholder="Enter your password"
                secureTextEntry
                style={{
                    borderWidth: 1,
                    padding: 12,
                    marginBottom: 16
                }}
            />

            <Button
                title={
                    loginMutation.isPending
                        ? "Signing in..."
                        : "Sign In"
                }
                onPress={() => loginMutation.mutate({ email, password })}
            />
            <Text style={{ marginTop: 16 }}>
                Don't have an account?{" "}
                <Link
                    href="/(auth)/register"
                    style={{ marginTop: 16, color: "blue" }}
                    >
                Register
                </Link>
            </Text>

        </View>
    )
}
