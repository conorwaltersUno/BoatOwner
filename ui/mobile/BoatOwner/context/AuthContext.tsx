import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { getAccessToken, getRefreshToken, saveTokens, clearTokens } from "../utils/tokenStorage";
import { useRouter } from "expo-router";

type AuthContextType = {
  isAuthenticated: boolean;
  setAuthenticated: (auth: boolean) => void;
  signOut: () => Promise<void>;
  authLoading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const accessToken = await getAccessToken();
      const refreshToken = await getRefreshToken();

      // If no tokens, log out
      if (!accessToken && !refreshToken) {
        setAuthenticated(false);
        setAuthLoading(false);
        return;
      }

      if (accessToken) {
        try {
          const res = await fetch(`${process.env.EXPO_PUBLIC_API_BASE_URL || ""}/auth-check`, {
            headers: { Authorization: `Bearer ${accessToken}` },
          });
          if (res.ok) {
            setAuthenticated(true);
            setAuthLoading(false);
            return;
          }

          if (res.status === 401 && refreshToken) {
            const refreshRes = await fetch(`${process.env.EXPO_PUBLIC_API_BASE_URL || ""}/api/users/token`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ refreshToken }),
            });
            if (refreshRes.ok) {
              const data = await refreshRes.json();
              await saveTokens(data.accessToken, refreshToken);
              setAuthenticated(true);
              setAuthLoading(false);
              return;
            }
          }
        } catch {
          console.log("Error during authentication check, will require re-login");
        }
      }

      await clearTokens();
      setAuthenticated(false);
      setAuthLoading(false);
      router.replace("/(auth)/SignIn");
    })();
  }, []);

  const signOut = async () => {
    await clearTokens();
    setAuthenticated(false);
    router.replace("/(auth)/SignIn");
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, setAuthenticated, signOut, authLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
