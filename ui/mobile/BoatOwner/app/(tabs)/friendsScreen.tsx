import React, { useState, useEffect } from "react";
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from "react-native";
import {
  useFriends,
  useFriendRequests,
  useSendFriendRequest,
  useRespondToFriendRequest,
  useRemoveFriend,
} from "../../hooks/useFriends";
import { searchUsers } from "../../api/fetch/friends.fetch";

const FriendsScreen: React.FC = () => {
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const { friends, refetch: refetchFriends } = useFriends();
  const { requests, refetch: refetchRequests } = useFriendRequests();
  const sendFriendRequest = useSendFriendRequest();
  const respondToFriendRequest = useRespondToFriendRequest();
  const removeFriend = useRemoveFriend();

  // Debounced search effect using real API
  useEffect(() => {
    if (!search || search.length < 2) {
      setSearchResults([]);
      setSearchLoading(false);
      return;
    }
    setSearchLoading(true);
    const timeout = setTimeout(async () => {
      try {
        const results = await searchUsers(search);
        setSearchResults(results);
      } catch {
        setSearchResults([]);
      }
      setSearchLoading(false);
    }, 400);

    return () => clearTimeout(timeout);
  }, [search]);

  const handleSendRequest = (email: string) => {
    sendFriendRequest.mutate(
      { email },
      {
        onSuccess: () => {
          Alert.alert("Friend Request Sent", `A friend request was sent to ${email}.`);
          setSearchResults([]);
          setSearch("");
          refetchRequests();
        },
        onError: (err: any) => {
          Alert.alert("Error", err?.message || "Could not send friend request.");
        },
      }
    );
  };

  const handleRespondRequest = (requestId: number, accept: boolean) => {
    respondToFriendRequest.mutate(
      { requestId, accept },
      {
        onSuccess: () => {
          Alert.alert(
            accept ? "Friend Request Accepted" : "Friend Request Declined",
            accept ? "You are now friends!" : "You have declined the friend request."
          );
          refetchFriends();
          refetchRequests();
        },
        onError: (err: any) => {
          Alert.alert("Error", err?.message || "Could not respond to friend request.");
        },
      }
    );
  };

  const handleRemoveFriend = (friendId: number, email: string) => {
    Alert.alert("Remove Friend", `Are you sure you want to remove ${email} from your friends?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => {
          removeFriend.mutate(friendId, {
            onSuccess: () => {
              Alert.alert("Removed", `${email} has been removed from your friends.`);
              refetchFriends();
            },
            onError: (err: any) => {
              Alert.alert("Error", err?.message || "Could not remove friend.");
            },
          });
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Add a Friend</Text>
      <View style={styles.row}>
        <TextInput
          style={styles.input}
          placeholder="Search by email"
          value={search}
          onChangeText={setSearch}
          autoCapitalize="none"
          keyboardType="email-address"
          returnKeyType="search"
        />
        {searchLoading && <ActivityIndicator size="small" color="#1976D2" style={{ marginLeft: 8 }} />}
      </View>
      {searchResults.length > 0 && (
        <View style={styles.searchResultsList}>
          {searchResults.map((user) => (
            <View key={user.id} style={styles.searchResultCard}>
              <Text style={styles.resultEmail}>{user.email}</Text>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => handleSendRequest(user.email)}
                disabled={sendFriendRequest.isPending}
              >
                <Text style={styles.addButtonText}>{sendFriendRequest.isPending ? "Sending..." : "Add Friend"}</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      <Text style={styles.header}>Pending Friend Requests</Text>
      {requests.length === 0 ? (
        <Text style={styles.emptyText}>No pending requests.</Text>
      ) : (
        <FlatList
          data={requests}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.requestCard}>
              <View style={{ flex: 1 }}>
                <Text style={styles.requestEmail}>{item.sender?.email}</Text>
                <Text style={styles.requestDate}>Requested: {new Date(item.created).toLocaleDateString()}</Text>
              </View>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: "#4CAF50" }]}
                onPress={() => handleRespondRequest(item.id, true)}
                disabled={respondToFriendRequest.isPending}
              >
                <Text style={styles.actionButtonText}>Accept</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: "#F44336" }]}
                onPress={() => handleRespondRequest(item.id, false)}
                disabled={respondToFriendRequest.isPending}
              >
                <Text style={styles.actionButtonText}>Decline</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}

      <Text style={styles.header}>Your Friends</Text>
      {friends.length === 0 ? (
        <Text style={styles.emptyText}>You have no friends yet.</Text>
      ) : (
        <FlatList
          data={friends}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.friendCard}>
              <Text style={styles.friendEmail}>{item.email}</Text>
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => handleRemoveFriend(item.id, item.email)}
                disabled={removeFriend.isPending}
              >
                <Text style={styles.removeButtonText}>Remove</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 18, backgroundColor: "#f9f9f9" },
  header: { fontWeight: "bold", fontSize: 20, marginTop: 18, marginBottom: 10, color: "#222" },
  row: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#bbb",
    borderRadius: 8,
    padding: 10,
    backgroundColor: "#fff",
    marginRight: 8,
    fontSize: 16,
  },
  searchResultsList: { marginBottom: 12 },
  searchButton: {
    backgroundColor: "#1976D2",
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
  },
  searchButtonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  searchResultCard: {
    backgroundColor: "#e3f2fd",
    borderRadius: 8,
    padding: 14,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  resultEmail: { fontSize: 16, color: "#1976D2", fontWeight: "bold" },
  addButton: {
    backgroundColor: "#388E3C",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  addButtonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  requestCard: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 14,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    elevation: 1,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
  },
  requestEmail: { fontWeight: "bold", fontSize: 16, color: "#222" },
  requestDate: { fontSize: 12, color: "#888" },
  actionButton: {
    marginLeft: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  actionButtonText: { color: "#fff", fontWeight: "bold" },
  friendCard: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 14,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    elevation: 1,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
  },
  friendEmail: { fontWeight: "bold", fontSize: 16, color: "#222" },
  removeButton: {
    backgroundColor: "#E53935",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  removeButtonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  emptyText: { color: "#888", fontStyle: "italic", marginBottom: 16, marginLeft: 4 },
});

export default FriendsScreen;
