import {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  PropsWithChildren,
} from "react";

import {
  getAccessToken,
  clearTokens,
  subscribeToSessionInvalidation,
} from "../services/auth-service.service";

import { router, useRootNavigationState } from "expo-router";
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

  const sessionRevision = useRef(0);
  const navigationState = useRootNavigationState();
  const [sessionInvalidated, setSessionInvalidated] = useState(false);

  function signIn() {
    sessionRevision.current++;
    setSessionInvalidated(false);
    setAuthenticated(true);
  }

  async function clearSession() {
    await clearTokens();
  }

  async function signOut() {
    try {
      await logout();
    } finally {
      await clearSession();
    }
  }

  useEffect(() => {
    if (sessionInvalidated && navigationState?.key) {
      router.replace("/(auth)/login");
      setSessionInvalidated(false);
    }
  }, [sessionInvalidated, navigationState?.key]);

  useEffect(() => {
    let active = true;
    const revision = sessionRevision.current;
    const unsubscribe = subscribeToSessionInvalidation(() => {
      sessionRevision.current++;
      setAuthenticated(false);
      setIsLoading(false);
      setSessionInvalidated(true);
    });
    async function restoreSession() {
      try {
        const token = await getAccessToken();
        if (active && sessionRevision.current === revision) setAuthenticated(!!token);
      } catch {
        if (active && sessionRevision.current === revision) setAuthenticated(false);
      } finally {
        if (active) setIsLoading(false);
      }
    }
    void restoreSession();
    return () => { active = false; unsubscribe(); };
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