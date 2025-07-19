import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchFriends,
  fetchFriendRequests,
  sendFriendRequest,
  respondToFriendRequest,
  removeFriend,
  fetchFriendsFeed,
  cancelPendingFriendRequest,
} from "@/api/fetch/friends.fetch";
import { FriendRequestDTO, FriendUserDTO, FriendsLogDTO } from "../interfaces/friends/friends";

export function useFriends() {
  const { data = [], refetch } = useQuery<FriendUserDTO[]>({
    queryKey: ["friends"],
    queryFn: fetchFriends,
  });
  return { friends: data, refetch };
}

export function useFriendRequests() {
  const { data = [], refetch } = useQuery<FriendRequestDTO[]>({
    queryKey: ["friendRequests"],
    queryFn: fetchFriendRequests,
  });
  return { requests: data, refetch };
}

export function useSendFriendRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ username }: { username: string }) => sendFriendRequest(username),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friendRequests"] });
    },
    onError: (error) => {
      console.error("Mutation error:", error);
    },
  });
}

export function useRespondToFriendRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ requestId, accept }: { requestId: number; accept: boolean }) =>
      respondToFriendRequest(requestId, accept),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friendRequests"] });
      queryClient.invalidateQueries({ queryKey: ["friends"] });
    },
    onError: (error) => {
      console.error("Mutation error:", error);
    },
  });
}

export function useRemoveFriend() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (friendId: number) => removeFriend(friendId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friends"] });
    },
    onError: (error) => {
      console.error("Mutation error:", error);
    },
  });
}

export function useFriendsFeed() {
  const { data = [], isLoading } = useQuery<FriendsLogDTO[]>({
    queryKey: ["friendsFeed"],
    queryFn: fetchFriendsFeed,
  });
  return { feed: data, isLoading };
}

export function useCancelPendingFriendRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (requestId: number) => cancelPendingFriendRequest(requestId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friendRequests"] });
      queryClient.invalidateQueries({ queryKey: ["friends"] });
      queryClient.invalidateQueries({ queryKey: ["searchResults"] });
    },
    onError: (error) => {
      console.error("Cancel friend request error:", error);
    },
  });
}
