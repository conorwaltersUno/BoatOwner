import * as SecureStore from "expo-secure-store";

export async function saveTokens(accessToken: string, refreshToken: string, userId?: number, boatId?: number) {
  await SecureStore.setItemAsync("accessToken", accessToken);
  await SecureStore.setItemAsync("refreshToken", refreshToken);
  if (userId !== undefined && userId !== null) await SecureStore.setItemAsync("userId", userId.toString());
  if (boatId !== undefined && boatId !== null) await SecureStore.setItemAsync("boatId", boatId.toString());
}

export async function getAccessToken() {
  return SecureStore.getItemAsync("accessToken");
}

export async function getRefreshToken() {
  return SecureStore.getItemAsync("refreshToken");
}

export async function clearTokens() {
  await SecureStore.deleteItemAsync("accessToken");
  await SecureStore.deleteItemAsync("refreshToken");
  await SecureStore.deleteItemAsync("userId");
  await SecureStore.deleteItemAsync("boatId");
}

export async function getUserId(): Promise<number | null> {
  const id = await SecureStore.getItemAsync("userId");
  const parsed = Number(id);
  return !isNaN(parsed) ? parsed : null;
}

export async function getBoatId(): Promise<number | null> {
  const id = await SecureStore.getItemAsync("boatId");
  const parsed = Number(id);
  return !isNaN(parsed) ? parsed : null;
}
