import { APIPort } from "@/constants/APIPort";
import { APIRoutes } from "@/constants/APIRoutes";
import Constants from "expo-constants";

const isLocalDev = process.env.EXPO_PUBLIC_IS_LOCAL_DEV === 'true';
const apiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL || "";

const apiUrl = isLocalDev
  ? "http://" + Constants.expoConfig?.hostUri!.split(`:`).shift() + `:${APIPort.localPort}`
  : apiBaseUrl;

export async function signUp(email: string, password: string, username: string, boat_name: string, boat_model: string) {
  const res = await fetch(`${apiUrl}${APIRoutes.users}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, username, boat_name, boat_model }),
  });
  if (!res.ok) throw new Error((await res.json()).message || "Sign up failed");
  return res.json();
}

export async function signIn(email: string, password: string) {
  const res = await fetch(`${apiUrl}${APIRoutes.users}/sign-in`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error((await res.json()).message || "Sign in failed");
  return res.json();
}
