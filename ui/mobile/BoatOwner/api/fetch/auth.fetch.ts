import { getAccessToken, getRefreshToken, saveTokens, clearTokens } from "@/utils/tokenStorage";
import { router } from "expo-router"; // or useRouter if you prefer

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || "";

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) return null;

  try {
    const res = await fetch(`${API_BASE_URL}/api/users/token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) throw new Error("Refresh failed");
    const data = await res.json();
    if (data.accessToken) {
      await saveTokens(data.accessToken, refreshToken);
      return data.accessToken;
    }
    return null;
  } catch {
    return null;
  }
}

export async function authFetch(input: RequestInfo, init: RequestInit = {}, retry = true): Promise<Response> {
  let accessToken = await getAccessToken();
  let headers = {
    ...(init.headers || {}),
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
  };

  let response = await fetch(input, { ...init, headers });

  if (response.status === 401 && retry) {
    const newAccessToken = await refreshAccessToken();
    if (newAccessToken) {
      headers = {
        ...headers,
        Authorization: `Bearer ${newAccessToken}`,
      };
      response = await fetch(input, { ...init, headers });
      if (response.status !== 401) return response;
    }

    await clearTokens();
    router.replace("/(auth)/SignIn");
    throw new Error("Session expired. Please sign in again.");
  }

  return response;
}
