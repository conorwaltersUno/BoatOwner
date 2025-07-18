import React, { useState } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSearchUsers, useSendFriendRequest, usePendingRequests, useAcceptFriendRequest, useRejectFriendRequest, useFriendsList } from '@/hooks/useFriends';

export default function Friend() {
  const [searchQuery, setSearchQuery] = useState('');
  const { data: searchResults, isLoading: searchLoading, error: searchError } = useSearchUsers(searchQuery);
  const { mutate: sendRequest, isPending: sending } = useSendFriendRequest();
  const { data: pendingRequests, isLoading: pendingLoading, error: pendingError } = usePendingRequests();
  const { mutate: acceptRequest } = useAcceptFriendRequest();
  const { mutate: rejectRequest } = useRejectFriendRequest();
  const { data: friendsList, isLoading: friendsLoading, error: friendsError } = useFriendsList();

  // Loading guard
  if (searchLoading || pendingLoading || friendsLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#2E66E7" />
        <Text style={styles.emptyText}>Loading friends data...</Text>
      </View>
    );
  }

  // Error guard
  if (searchError || pendingError || friendsError) {
    const errorMsg =
      (typeof searchError === 'object' && searchError && 'message' in searchError && (searchError as any).message) ||
      (typeof pendingError === 'object' && pendingError && 'message' in pendingError && (pendingError as any).message) ||
      (typeof friendsError === 'object' && friendsError && 'message' in friendsError && (friendsError as any).message) ||
      'Unable to load friends data.';
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{errorMsg}</Text>
      </View>
    );
  }

  const isUserFriendOrPending = (username: string) => {
    const lower = username.toLowerCase();
    const isFriend = friendsList?.some(f => f.friend_details.username.toLowerCase() === lower);
    const isPending = pendingRequests?.some(r => r.sender_details.username.toLowerCase() === lower);
    return isFriend || isPending;
  };

  const handleSendRequest = (username: string) => {
    sendRequest(username, {
      onSuccess: () => Alert.alert('Success', 'Friend request sent!'),
      onError: (error: any) => Alert.alert('Error', error.message),
    });
  };

  const handleAcceptRequest = (requestId: number) => {
    acceptRequest(requestId, {
      onSuccess: () => Alert.alert('Success', 'Friend request accepted!'),
    });
  };

  const handleRejectRequest = (requestId: number) => {
    rejectRequest(requestId);
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" style={{ marginRight: 8 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search users by username..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color="#aaa" />
          </TouchableOpacity>
        )}
      </View>
      {/* Search Results */}
      {searchQuery.length >= 2 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Search Results</Text>
          {searchLoading && <ActivityIndicator />}
          <FlatList
            data={searchResults || []}
            keyExtractor={item => item.id.toString()}
            renderItem={({ item }) => (
              <View style={styles.userCard}>
                <View style={styles.avatarCircle}>
                  <Text style={styles.avatarText}>{item.username[0]?.toUpperCase() || '?'}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.username}>{item.username}</Text>
                  <Text style={styles.email}>{item.email}</Text>
                </View>
                <TouchableOpacity
                  style={[styles.addButton, isUserFriendOrPending(item.username) && styles.addButtonDisabled]}
                  onPress={() => handleSendRequest(item.username)}
                  disabled={sending || isUserFriendOrPending(item.username)}
                >
                  <Text style={styles.addButtonText}>
                    {isUserFriendOrPending(item.username) ? 'Requested' : 'Add'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
            ListEmptyComponent={!searchLoading ? <Text style={styles.emptyText}>No users found.</Text> : null}
          />
        </View>
      )}
      {/* Pending Requests */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Pending Requests</Text>
        {pendingLoading && <ActivityIndicator />}
        <FlatList
          data={pendingRequests || []}
          keyExtractor={item => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.requestCard}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarText}>{item.sender_details.username[0]?.toUpperCase() || '?'}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.username}>{item.sender_details.username}</Text>
                <Text style={styles.email}>{item.sender_details.email}</Text>
              </View>
              <TouchableOpacity style={styles.acceptButton} onPress={() => handleAcceptRequest(item.id)}>
                <Ionicons name="checkmark" size={20} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.rejectButton} onPress={() => handleRejectRequest(item.id)}>
                <Ionicons name="close" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          )}
          ListEmptyComponent={!pendingLoading ? <Text style={styles.emptyText}>No pending requests.</Text> : null}
        />
      </View>
      {/* Friends List */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your Friends</Text>
        {friendsLoading && <ActivityIndicator />}
        <FlatList
          data={friendsList || []}
          keyExtractor={item => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.friendCard}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarText}>{item.friend_details.username[0]?.toUpperCase() || '?'}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.username}>{item.friend_details.username}</Text>
                <Text style={styles.email}>{item.friend_details.email}</Text>
              </View>
            </View>
          )}
          ListEmptyComponent={!friendsLoading ? <Text style={styles.emptyText}>No friends yet.</Text> : null}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 18,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    backgroundColor: 'transparent',
  },
  section: {
    marginBottom: 22,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 14,
    marginBottom: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
  },
  requestCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 14,
    marginBottom: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
  },
  friendCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 14,
    marginBottom: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
  },
  avatarCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#e0e7ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  avatarText: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#2E66E7',
  },
  username: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  email: {
    fontSize: 14,
    color: '#888',
  },
  addButton: {
    backgroundColor: '#2E66E7',
    borderRadius: 20,
    paddingVertical: 7,
    paddingHorizontal: 18,
    marginLeft: 10,
  },
  addButtonDisabled: {
    backgroundColor: '#b3c6f7',
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
  acceptButton: {
    backgroundColor: '#34C759',
    borderRadius: 20,
    padding: 8,
    marginLeft: 8,
  },
  rejectButton: {
    backgroundColor: '#FF3B30',
    borderRadius: 20,
    padding: 8,
    marginLeft: 8,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
    marginTop: 10,
  },
  errorText: {
    color: '#e74c3c',
    marginBottom: 8,
    textAlign: 'center',
  },
});
