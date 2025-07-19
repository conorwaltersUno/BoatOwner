import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { getAccessToken, getRefreshToken, saveTokens, clearTokens, getUserId } from "../utils/tokenStorage";
import { useRouter } from "expo-router";

type AuthContextType = {
  isAuthenticated: boolean;
  setAuthenticated: (auth: boolean) => void;
  signOut: () => Promise<void>;
  authLoading: boolean;
  user: { id: number | null; username?: string | null; email?: string | null } | null;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [user, setUser] = useState<{ id: number | null; username?: string | null; email?: string | null } | null>(null);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const accessToken = await getAccessToken();
      const refreshToken = await getRefreshToken();

      // If no tokens, log out
      if (!accessToken && !refreshToken) {
        setAuthenticated(false);
        setAuthLoading(false);
        setUser(null);
        return;
      }

      if (accessToken) {
        try {
          const res = await fetch(`${process.env.EXPO_PUBLIC_API_BASE_URL || ""}/auth-check`, {
            headers: { Authorization: `Bearer ${accessToken}` },
          });
          if (res.ok) {
            // Optionally, fetch user info here if needed
            setAuthenticated(true);
            setAuthLoading(false);
            // Optionally set user info here if available
            return;
          }
        } catch (err) {
          console.log("Error during authentication check, will require re-login");
        }
      }

      // Try refresh token flow if accessToken is missing or invalid
      if (refreshToken) {
        try {
          const refreshRes = await fetch(`${process.env.EXPO_PUBLIC_API_BASE_URL || ""}/api/users/token`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refreshToken }),
          });
          if (refreshRes.ok) {
            const data = await refreshRes.json();
            if (data.accessToken && refreshToken) {
              await saveTokens(data.accessToken, refreshToken, data.userId, data.boatId);
              setAuthenticated(true);
              setUser({ id: data.userId });
              setAuthLoading(false);
              return;
            }
          }
        } catch (err) {
          console.log("Error during refresh token flow, will require re-login");
        }
      }

      // If all else fails, log out
      setAuthenticated(false);
      setUser(null);
      setAuthLoading(false);
    })();
  }, []);

  const signOut = async () => {
    await clearTokens();
    setAuthenticated(false);
    setUser(null);
    router.replace("/(auth)/SignIn");
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, setAuthenticated, signOut, authLoading, user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
