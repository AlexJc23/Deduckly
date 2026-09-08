import {
  createContext,
  useContext,
  useEffect,
  useState,
  PropsWithChildren,
} from "react";

import {
  getAccessToken,
  clearTokens,
} from "../services/auth-service.service";

import { router } from "expo-router";
import { logout } from "@/features/auth/api/auth.api";

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: () => void;
  signOut: () => void;
  clearSession: () => Promise<void>;
}

const AuthContext =
  createContext<AuthContextType | null>(null);

export function AuthProvider({
  children,
}: PropsWithChildren) {
  const [isAuthenticated, setAuthenticated] =
    useState(false);

  const [isLoading, setIsLoading] =
    useState(true);

  function signIn() {
    setAuthenticated(true);
  }

  async function clearSession() {
    await clearTokens();
    setAuthenticated(false);
    router.replace("/(auth)/login");
  }

  async function signOut() {
    try {
      await logout();
    } finally {
      await clearSession();
    }
  }

  useEffect(() => {
    async function restoreSession() {
      try {
        const token = await getAccessToken();

        setAuthenticated(!!token);
      } finally {
        setIsLoading(false);
      }
    }

    restoreSession();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        signIn,
        signOut,
        clearSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used within an AuthProvider"
    );
  }

  return context;
}