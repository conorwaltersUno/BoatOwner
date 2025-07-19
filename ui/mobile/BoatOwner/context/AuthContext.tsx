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
      console.log('[AuthContext] accessToken:', accessToken);
      console.log('[AuthContext] refreshToken:', refreshToken);

      // If no tokens, log out
      if (!accessToken && !refreshToken) {
        setAuthenticated(false);
        setAuthLoading(false);
        setUser(null);
        console.log('[AuthContext] setUser(null) - no tokens');
        // Force sign out and redirect to login if not already there
        if (router && typeof router.replace === 'function') {
          router.replace("/(auth)/SignIn");
        }
        return;
      }

      // Always use a valid API base URL
      let apiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL;
      if (!apiBaseUrl || apiBaseUrl.trim() === "") {
        apiBaseUrl = "http://localhost:3000"; // fallback for local dev
      }
      console.log('[AuthContext] Using apiBaseUrl:', apiBaseUrl);

      if (accessToken) {
        try {
          const res = await fetch(`${apiBaseUrl}/auth-check`, {
            headers: { Authorization: `Bearer ${accessToken}` },
          });
          console.log('[AuthContext] /auth-check status:', res.status);
          if (res.ok) {
            // Fetch user info after successful auth-check
            const userId = await getUserId();
            console.log('[AuthContext] userId:', userId);
            if (userId) {
              const userUrl = `${apiBaseUrl}/users/${userId}`;
              console.log('[AuthContext] Fetching user info:', userUrl);
              try {
                const userRes = await fetch(userUrl, {
                  headers: { Authorization: `Bearer ${accessToken}` },
                });
                console.log('[AuthContext] /users/:userId status:', userRes.status);
                let userData = null;
                let rawBody = null;
                try {
                  rawBody = await userRes.text();
                  console.log('[AuthContext] /users/:userId raw body:', rawBody);
                  userData = JSON.parse(rawBody);
                } catch (parseErr) {
                  // If already an object, use as is
                  userData = rawBody;
                  console.warn('[AuthContext] Could not parse user info as JSON, using rawBody:', rawBody);
                }
                if (userRes.ok && userData && userData.id) {
                  setUser({
                    id: userData.id,
                    username: userData.username,
                    email: userData.email,
                  });
                  console.log('[AuthContext] setUser:', {
                    id: userData.id,
                    username: userData.username,
                    email: userData.email,
                  });
                } else if (userRes.ok) {
                  setUser({ id: userId });
                  console.log('[AuthContext] setUser fallback (missing fields):', { id: userId });
                } else {
                  console.warn('[AuthContext] User info fetch failed:', userRes.status, rawBody);
                  setUser({ id: userId });
                  console.log('[AuthContext] setUser fallback:', { id: userId });
                }
              } catch (err) {
                console.error('[AuthContext] Error fetching user info:', err);
                setUser({ id: userId });
                console.log('[AuthContext] setUser fallback (fetch error):', { id: userId });
              }
            } else {
              // If userId is missing, log error and set user to minimal object
              console.error('[AuthContext] No userId found after auth-check');
              setUser({ id: null });
            }
            setAuthenticated(true);
            setAuthLoading(false);
            return;
          } else {
            // If auth-check fails, clear tokens and force sign out
            const errBody = await res.text();
            console.error('[AuthContext] /auth-check failed:', res.status, errBody);
            await clearTokens();
            setAuthenticated(false);
            setUser(null);
            setAuthLoading(false);
            console.log('[AuthContext] setUser(null) - auth-check failed');
            router.replace("/(auth)/SignIn");
            return;
          }
        } catch (err) {
          // On error, clear tokens and force sign out
          console.error('[AuthContext] error in auth-check:', err);
          await clearTokens();
          setAuthenticated(false);
          setUser(null);
          setAuthLoading(false);
          console.log('[AuthContext] setUser(null) - error in auth-check', err);
          router.replace("/(auth)/SignIn");
          return;
        }
      }

      // Try refresh token flow if accessToken is missing or invalid
      if (refreshToken) {
        try {
          const refreshUrl = `${apiBaseUrl}/api/users/token`;
          const res = await fetch(refreshUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refreshToken }),
          });
          if (res.ok) {
            const data = await res.json();
            if (data.accessToken) {
              await saveTokens(data.accessToken, refreshToken);
              const newAccessToken = data.accessToken;
              const authCheckUrl = `${apiBaseUrl}/auth-check`;
              const authRes = await fetch(authCheckUrl, {
                headers: { Authorization: `Bearer ${newAccessToken}` },
              });
              if (authRes.ok) {
                const userId = await getUserId();
                if (userId) {
                  const userUrl = `${apiBaseUrl}/users/${userId}`;
                  try {
                    const userRes = await fetch(userUrl, {
                      headers: { Authorization: `Bearer ${newAccessToken}` },
                    });
                    if (userRes.ok) {
                      const userData = await userRes.json();
                      setUser({
                        id: userData.id,
                        username: userData.username,
                        email: userData.email,
                      });
                      console.log('[AuthContext] setUser (refresh):', {
                        id: userData.id,
                        username: userData.username,
                        email: userData.email,
                      });
                    } else {
                      const errBody = await userRes.text();
                      console.warn('[AuthContext] User info fetch failed (refresh):', userRes.status, errBody);
                      setUser({ id: userId });
                      console.log('[AuthContext] setUser fallback (refresh):', { id: userId });
                    }
                  } catch (err) {
                    const userRes = await fetch(userUrl, {
                      headers: { Authorization: `Bearer ${newAccessToken}` },
                    });
                    const errBody = await userRes.text();
                    console.error('[AuthContext] Error parsing user info JSON (refresh). Response body:', errBody);
                    setUser({ id: userId });
                    console.log('[AuthContext] setUser fallback (refresh parse error):', { id: userId });
                  }
                } else {
                  console.error('[AuthContext] No userId found after auth-check (refresh)');
                  setUser({ id: null });
                }
                setAuthenticated(true);
                setAuthLoading(false);
                return;
              } else {
                // If auth-check after refresh fails, clear tokens and force sign out
                await clearTokens();
                setAuthenticated(false);
                setUser(null);
                setAuthLoading(false);
                console.log('[AuthContext] setUser(null) - auth-check after refresh failed');
                router.replace("/(auth)/SignIn");
                return;
              }
            }
          } else {
            // If refresh fails, clear tokens and force sign out
            await clearTokens();
            setAuthenticated(false);
            setUser(null);
            setAuthLoading(false);
            console.log('[AuthContext] setUser(null) - refresh failed');
            router.replace("/(auth)/SignIn");
            return;
          }
        } catch (err) {
          // On error, clear tokens and force sign out
          await clearTokens();
          setAuthenticated(false);
          setUser(null);
          setAuthLoading(false);
          console.log('[AuthContext] setUser(null) - error in refresh', err);
          router.replace("/(auth)/SignIn");
          return;
        }
      }
      // If all else fails
      setAuthenticated(false);
      setAuthLoading(false);
      setUser(null);
      console.log('[AuthContext] setUser(null) - all else failed');
      router.replace("/(auth)/SignIn");
    })();
  }, []);

  const signOut = async () => {
    await clearTokens();
    setAuthenticated(false);
    setUser(null);
    console.log('[AuthContext] setUser(null) - signOut');
    router.replace("/(auth)/SignIn");
  };

  // Log user state on every render
  useEffect(() => {
    console.log('[AuthContext] Render: user =', user);
  }, [user]);

  return (
    <AuthContext.Provider value={{ isAuthenticated, setAuthenticated, signOut, authLoading, user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  console.log('[useAuth] Context:', ctx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
