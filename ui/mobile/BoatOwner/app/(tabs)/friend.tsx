import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet, Alert, Platform, ToastAndroid } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFriends, useFriendRequests, useSendFriendRequest, useRespondToFriendRequest, useRemoveFriend, useFriendsFeed } from '@/hooks/useFriends';
import { searchUsers } from '@/api/fetch/friends.fetch';
import { useAuth } from '../../context/AuthContext';
import CollapsibleSection from '@/components/CollapsibleSection';
import { useFocusEffect } from '@react-navigation/native';
import type { UserSearchResult } from '@/interfaces/friends';

export default function Friend() {
  const [activeTab, setActiveTab] = useState<'logs' | 'manage'>('logs');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const { friends, refetch: refetchFriends } = useFriends();
  const { requests, refetch: refetchRequests } = useFriendRequests();
  const sendFriendRequest = useSendFriendRequest();
  const respondToFriendRequest = useRespondToFriendRequest();
  const removeFriend = useRemoveFriend();
  const { feed: friendsFeed, isLoading: feedLoading } = useFriendsFeed();
  const { user } = useAuth();

  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (!trimmed) {
      setSearchResults([]);
      setSearchLoading(false);
      return;
    }
    if (trimmed.length < 1) {
      setSearchResults([]);
      setSearchLoading(false);
      return;
    }
    setSearchLoading(true);
    const timeout = setTimeout(async () => {
      try {
        const results = await searchUsers(trimmed);
        setSearchResults(
          results.map((u: any) => ({
            id: u.id,
            username: u.username || u.name || u.email?.split('@')[0] || 'User',
            email: u.email,
            friendStatus: u.friendStatus,
            pendingRequestId: u.pendingRequestId,
          }))
        );
      } catch {
        setSearchResults([]);
      }
      setSearchLoading(false);
    }, 400);
    return () => clearTimeout(timeout);
  }, [searchQuery]);

  // Refetch on tab focus
  useFocusEffect(
    useCallback(() => {
      refetchFriends();
      refetchRequests();
    }, [refetchFriends, refetchRequests])
  );

  // Helper for Toast/Alert
  function showToast(msg: string) {
    if (Platform.OS === 'android') {
      ToastAndroid.show(msg, ToastAndroid.SHORT);
    } else {
      Alert.alert(msg);
    }
  }

  // Friend request status helper
  function getUserFriendStatus(user: UserSearchResult) {
    if (user.friendStatus === 'pending') return 'Requested';
    if (user.friendStatus === 'incoming') return 'Respond';
    if (friends.some(f => f.id === user.id)) return 'Friends';
    return 'Add';
  }

  console.log('currentUser:', user);
  const incomingRequests = requests.filter(r => r.status === 'pending');
  console.log('incomingRequests:', incomingRequests);
  const incomingCount = incomingRequests.length;
  const [incomingOpen, setIncomingOpen] = useState(incomingCount >= 0);
  useEffect(() => {
    setIncomingOpen(incomingCount >= 0);
  }, [incomingCount]);

  // Remove friend handler
  const handleRemoveFriend = (friendId: number, email: string) => {
    Alert.alert(
      'Remove Friend',
      `Are you sure you want to remove ${email} from your friends?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            removeFriend.mutate(friendId, {
              onSuccess: () => {
                showToast('Friend removed');
                refetchFriends();
              },
              onError: (err: any) => {
                showToast(err?.message || 'Could not remove friend.');
              },
            });
          },
        },
      ]
    );
  };

  // Send friend request handler
  const handleSendRequest = (email: string) => {
    sendFriendRequest.mutate(
      { email },
      {
        onSuccess: () => {
          showToast('Friend request sent');
          setSearchResults([]);
          setSearchQuery('');
          refetchRequests();
        },
        onError: (err: any) => {
          showToast(err?.message || 'Could not send friend request.');
        },
      }
    );
  };

  // Respond to friend request handler
  const handleRespondRequest = (requestId: number, accept: boolean) => {
    respondToFriendRequest.mutate(
      { requestId, accept },
      {
        onSuccess: () => {
          showToast(accept ? 'Friend request accepted' : 'Friend request declined');
          refetchFriends();
          refetchRequests();
        },
        onError: (err: any) => {
          showToast(err?.message || 'Could not respond to friend request.');
        },
      }
    );
  };

  // UI rendering
  return (
    <View style={styles.container}>
      {/* Tab Switcher */}
      <View style={styles.tabSwitcher}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'logs' && styles.tabActive]}
          onPress={() => setActiveTab('logs')}
        >
          <Text style={[styles.tabText, activeTab === 'logs' && styles.tabTextActive]}>Friends' Logs</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'manage' && styles.tabActive]}
          onPress={() => setActiveTab('manage')}
        >
          <Text style={[styles.tabText, activeTab === 'manage' && styles.tabTextActive]}>Manage Friends</Text>
        </TouchableOpacity>
      </View>

      {/* Friends' Logs Tab */}
      {activeTab === 'logs' && (
        <View style={{ flex: 1 }}>
          {feedLoading ? (
            <ActivityIndicator style={{ marginTop: 32 }} />
          ) : friendsFeed.length === 0 ? (
            <Text style={styles.emptyText}>No logs from friends yet.</Text>
          ) : (
            <FlatList
              data={friendsFeed}
              keyExtractor={item => String(item.id)}
              renderItem={({ item }) => (
                <View style={styles.logCard}>
                  <Text style={styles.logUser}>{item.user?.name || item.user?.email || 'Friend'}</Text>
                  <Text style={styles.logDate}>{new Date(item.created_on).toLocaleString()}</Text>
                  {/* Add more log fields as needed */}
                </View>
              )}
              contentContainerStyle={{ paddingBottom: 32 }}
            />
          )}
        </View>
      )}

      {/* Manage Friends Tab */}
      {activeTab === 'manage' && (
        <View style={{ flex: 1 }}>
          {/* Search Users */}
          <TextInput
            style={styles.searchInput}
            placeholder="Search users by username or email"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery.trim().length > 0 && searchQuery.trim().length < 1 && (
            <Text style={{ color: 'red', textAlign: 'center' }}>Enter at least 1 character to search.</Text>
          )}
          {searchLoading && <ActivityIndicator style={{ marginVertical: 8 }} />}
          {searchQuery.trim().length >= 1 && !searchLoading && (
            <FlatList
              data={searchResults}
              keyExtractor={item => String(item.id)}
              renderItem={({ item }) => {
                const status = getUserFriendStatus(item);
                return (
                  <View style={styles.searchResultRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.searchResultName}>
                        {item.username || item.email?.split('@')[0] || 'User'}
                      </Text>
                      <Text style={styles.searchResultEmail}>{item.email}</Text>
                    </View>
                    <TouchableOpacity
                      style={[
                        styles.actionButton,
                        status === 'Add' && styles.actionButtonAdd,
                        status === 'Requested' && styles.actionButtonRequested,
                        status === 'Friends' && styles.actionButtonFriends,
                        status === 'Respond' && styles.actionButtonRespond,
                      ]}
                      disabled={status !== 'Add'}
                      onPress={() => handleSendRequest(item.email)}
                    >
                      <Text style={styles.actionButtonText}>{status}</Text>
                    </TouchableOpacity>
                  </View>
                );
              }}
              ListEmptyComponent={<Text style={styles.emptyText}>No users found.</Text>}
              style={{ maxHeight: 200 }}
            />
          )}

          {/* Incoming Friend Requests */}
          <CollapsibleSection
            title={`Incoming Requests${incomingCount > 0 ? ` (${incomingCount})` : ''}`}
            initiallyCollapsed={!incomingOpen}
          >
            {incomingRequests.length === 0 ? (
              <Text style={styles.emptyText}>No incoming requests.</Text>
            ) : (
              <FlatList
                data={incomingRequests}
                keyExtractor={item => String(item.id)}
                renderItem={({ item }) => (
                  <View style={styles.requestRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.requestName}>{item.sender_details?.username || item.sender_details?.email || 'User'}</Text>
                      <Text style={styles.requestEmail}>{item.sender_details?.email}</Text>
                    </View>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.actionButtonAdd]}
                      onPress={() => handleRespondRequest(item.id, true)}
                    >
                      <Text style={styles.actionButtonText}>Accept</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.actionButtonRequested]}
                      onPress={() => handleRespondRequest(item.id, false)}
                    >
                      <Text style={styles.actionButtonText}>Decline</Text>
                    </TouchableOpacity>
                  </View>
                )}
              />
            )}
          </CollapsibleSection>

          {/* Friends List */}
          <CollapsibleSection title={`Your Friends (${friends.length})`} initiallyCollapsed={false}>
            {friends.length === 0 ? (
              <Text style={styles.emptyText}>You have no friends yet.</Text>
            ) : (
              <FlatList
                data={friends}
                keyExtractor={item => String(item.id)}
                renderItem={({ item }) => (
                  <View style={styles.friendRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.friendName}>{item.name || item.email}</Text>
                      <Text style={styles.friendEmail}>{item.email}</Text>
                    </View>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.actionButtonRemove]}
                      onPress={() => handleRemoveFriend(item.id, item.email)}
                    >
                      <Ionicons name="person-remove" size={20} color="#fff" />
                    </TouchableOpacity>
                  </View>
                )}
              />
            )}
          </CollapsibleSection>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingTop: 8 },
  tabSwitcher: { flexDirection: 'row', marginBottom: 8, borderBottomWidth: 1, borderColor: '#eee' },
  tabButton: { flex: 1, padding: 12, alignItems: 'center' },
  tabActive: { borderBottomWidth: 2, borderColor: '#007AFF' },
  tabText: { fontSize: 16, color: '#888' },
  tabTextActive: { color: '#007AFF', fontWeight: 'bold' },
  searchInput: { borderWidth: 1, borderColor: '#eee', borderRadius: 8, padding: 10, margin: 8, fontSize: 16 },
  searchResultRow: { flexDirection: 'row', alignItems: 'center', padding: 8, borderBottomWidth: 1, borderColor: '#f0f0f0' },
  searchResultName: { fontWeight: 'bold', fontSize: 16 },
  searchResultEmail: { color: '#888', fontSize: 13 },
  actionButton: { paddingVertical: 6, paddingHorizontal: 14, borderRadius: 6, marginLeft: 8 },
  actionButtonAdd: { backgroundColor: '#007AFF' },
  actionButtonRequested: { backgroundColor: '#aaa' },
  actionButtonFriends: { backgroundColor: '#4CAF50' },
  actionButtonRespond: { backgroundColor: '#FFA500' },
  actionButtonRemove: { backgroundColor: '#E53935' },
  actionButtonText: { color: '#fff', fontWeight: 'bold' },
  emptyText: { textAlign: 'center', color: '#888', marginVertical: 16 },
  requestRow: { flexDirection: 'row', alignItems: 'center', padding: 8, borderBottomWidth: 1, borderColor: '#f0f0f0' },
  requestName: { fontWeight: 'bold', fontSize: 16 },
  requestEmail: { color: '#888', fontSize: 13 },
  friendRow: { flexDirection: 'row', alignItems: 'center', padding: 8, borderBottomWidth: 1, borderColor: '#f0f0f0' },
  friendName: { fontWeight: 'bold', fontSize: 16 },
  friendEmail: { color: '#888', fontSize: 13 },
  logCard: { backgroundColor: '#f9f9f9', borderRadius: 8, padding: 12, margin: 8, marginBottom: 0 },
  logUser: { fontWeight: 'bold', fontSize: 15, marginBottom: 2 },
  logDate: { color: '#888', fontSize: 13 },
});
