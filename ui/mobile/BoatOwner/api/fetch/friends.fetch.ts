import { FriendRequestDTO, FriendUserDTO, FriendsLogDTO } from "@/interfaces/friends/friends";
import Constants from "expo-constants";
import { APIPort } from "@/constants/APIPort";
import { authFetch } from "./auth.fetch";
import { getUserId } from "@/utils/tokenStorage";

const isLocalDev = process.env.EXPO_PUBLIC_IS_LOCAL_DEV;
const apiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL || "";

const apiUrl = isLocalDev
  ? "http://" + Constants.expoConfig?.hostUri!.split(`:`).shift() + `:${APIPort.localPort}`
  : `https://${apiBaseUrl}:${APIPort.localPort}`;

// GET /friends/:userId
export const fetchFriends = async (): Promise<FriendUserDTO[]> => {
  const userId = await getUserId();
  const response = await authFetch(`${apiUrl}/friends/${userId}`);
  if (!response.ok) throw new Error("Failed to fetch friends");
  return await response.json();
};

// GET /friends/search
export const searchUsers = async (q: string): Promise<FriendUserDTO[]> => {
  const userId = await getUserId();
  const response = await authFetch(`${apiUrl}/friends/search`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ q, userId: Number(userId) }),
  });
  if (!response.ok) throw new Error("Failed to search users");
  return response.json();
};

// GET /friends/requests/:userId
export const fetchFriendRequests = async (): Promise<FriendRequestDTO[]> => {
  const userId = await getUserId();
  const response = await authFetch(`${apiUrl}/friends/requests/${userId}`);
  if (!response.ok) throw new Error("Failed to fetch friend requests");
  return await response.json();
};

// POST /friends/request
export const sendFriendRequest = async (email: string): Promise<FriendRequestDTO> => {
  const userId = await getUserId();
  const response = await authFetch(`${apiUrl}/friends/request`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, userId }),
  });
  if (response.status !== 201) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "Failed to send friend request");
  }
  return await response.json();
};

// POST /friends/respond
export const respondToFriendRequest = async (requestId: number, accept: boolean): Promise<any> => {
  const userId = await getUserId();
  const response = await authFetch(`${apiUrl}/friends/respond`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ requestId, accept, userId }),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "Failed to respond to friend request");
  }
  return await response.json();
};

// DELETE /friends/:friendId
export const removeFriend = async (friendId: number): Promise<void> => {
  const response = await authFetch(`${apiUrl}/friends/${friendId}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "Failed to remove friend");
  }
};

// GET /friends/:userId/logs
export const fetchFriendsFeed = async (): Promise<FriendsLogDTO[]> => {
  const userId = await getUserId();
  const response = await authFetch(`${apiUrl}/friends/${userId}/logs`);
  if (!response.ok) throw new Error("Failed to fetch friends feed");
  return await response.json();
};
