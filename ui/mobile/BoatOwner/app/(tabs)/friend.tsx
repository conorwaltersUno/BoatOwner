import React, { useState, useEffect, useCallback } from 'react';
import { View, TextInput, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet, Alert, Platform, ToastAndroid } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFriends, useFriendRequests, useSendFriendRequest, useRespondToFriendRequest, useRemoveFriend, useFriendsFeed, useCancelPendingFriendRequest } from '@/hooks/useFriends';
import { searchUsers } from '@/api/fetch/friends.fetch';
import { useAuth } from '../../context/AuthContext';
import CollapsibleSection from '@/components/CollapsibleSection';
import { useFocusEffect } from '@react-navigation/native';
import type { UserSearchResult } from '@/interfaces/friends';
import LogRouteMapWithReplay from '@/components/LogRouteMapWithReplay';
import dayjs from 'dayjs';
import { useQueryClient } from '@tanstack/react-query';
import { useTheme } from '@/context/ThemeContext';
import { ThemedText } from '@/components/ThemedText';

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
  const cancelPendingFriendRequest = useCancelPendingFriendRequest();
  const { feed: friendsFeed, isLoading: feedLoading } = useFriendsFeed();
  const queryClient = useQueryClient();
  const { theme } = useTheme();

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
            username: u.username || 'User',
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

  const incomingRequests = requests.filter(r => r.status === 'pending');
  const incomingCount = incomingRequests.length;
  const [incomingOpen, setIncomingOpen] = useState(incomingCount >= 0);
  useEffect(() => {
    setIncomingOpen(incomingCount >= 0);
  }, [incomingCount]);

  // Remove friend handler
  const handleRemoveFriend = (friendId: number, username: string) => {
    Alert.alert(
      'Remove Friend',
      `Are you sure you want to remove ${username} from your friends?`,
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
  const handleSendRequest = (username: string) => {
    sendFriendRequest.mutate(
      { username },
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
    <View style={[styles.container, { backgroundColor: theme.background }]}> {/* Main container uses theme */}
      {/* Tab Switcher */}
      <View style={[styles.tabSwitcher, { borderColor: theme.border }]}> {/* Tab switcher border */}
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'logs' && { borderBottomWidth: 2, borderColor: theme.primary }]}
          onPress={() => setActiveTab('logs')}
        >
          <ThemedText style={[styles.tabText, activeTab === 'logs' && { color: theme.primary, fontWeight: 'bold' }]}>Friends' Logs</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'manage' && { borderBottomWidth: 2, borderColor: theme.primary }]}
          onPress={() => setActiveTab('manage')}
        >
          <ThemedText style={[styles.tabText, activeTab === 'manage' && { color: theme.primary, fontWeight: 'bold' }]}>Manage Friends</ThemedText>
        </TouchableOpacity>
      </View>
      {/* Friends' Logs Tab */}
      {activeTab === 'logs' && (
        <View style={{ flex: 1, backgroundColor: theme.background }}>
          <FlatList
            data={friendsFeed}
            keyExtractor={item => String(item.id)}
            renderItem={({ item }) => {
              const username = item.user?.username || 'Unknown User';
              const boatName = item.boat?.name || '';
              const boatModel = item.boat?.model || '';
              const logTime = item.log_started ? dayjs(item.log_started).format('YYYY-MM-DD HH:mm') : '';
              const durationSec = item.log_started && item.log_ended ? Math.round((new Date(item.log_ended).getTime() - new Date(item.log_started).getTime()) / 1000) : 0;
              const formatDuration = (seconds: number) => {
                if (isNaN(seconds) || seconds < 0) return '0s';
                const h = Math.floor(seconds / 3600);
                const m = Math.floor((seconds % 3600) / 60);
                const s = seconds % 60;
                return [h ? `${h}h` : '', m ? `${m}m` : '', `${s}s`].filter(Boolean).join(' ');
              };
              // Convert log fields to Date for LogRouteMapWithReplay
              const logForMap = {
                ...item,
                log_started: item.log_started ? new Date(item.log_started) : new Date(0),
                log_ended: item.log_ended ? new Date(item.log_ended) : new Date(0),
                created_on: item.created_on ? new Date(item.created_on) : new Date(0),
              };
              return (
                <View style={[
                  styles.igCard,
                  {
                    backgroundColor: theme.card, // Use theme.card for both modes for consistency
                    borderColor: theme.primary,
                    shadowColor: theme.primary,
                  },
                ]}>
                  <ThemedText style={[styles.igUsername, { color: theme.primary, backgroundColor: theme.card }]}> {username} </ThemedText>
                  <View style={[styles.igMapContainer, { marginLeft: 10, marginRight: 10 }]}> {/* Add margin to map */}
                    <LogRouteMapWithReplay 
                      log={logForMap} 
                      height={220} 
                      showReplayControls={true}
                      // Pass theme for button coloring
                    />
                  </View>
                  <View style={styles.igInfoRow}>
                    <View style={{ flex: 1 }}>
                      <ThemedText style={[styles.igBoat, { color: theme.text }]}>{boatName}</ThemedText>
                      <ThemedText style={[styles.igBoatModel, { color: theme.text + '99' }]}>{boatModel}</ThemedText>
                    </View>
                    <View style={{ flex: 1 }}>
                      <ThemedText style={[styles.igTime, { color: theme.text + '99' }]}>{logTime}</ThemedText>
                      <ThemedText style={[styles.igDuration, { color: theme.text + '99' }]}>Duration: {formatDuration(durationSec)}</ThemedText>
                    </View>
                  </View>
                  {/* Action button container with lighter card color */}
                  <View style={{ backgroundColor: theme.background + '22', borderRadius: 10, marginHorizontal: 12, marginBottom: 8, marginTop: 4, padding: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' }}>
                    {/* Place action buttons here if needed */}
                  </View>
                  {item.description ? (
                    <ThemedText style={[styles.igDescription, { color: theme.text }]}>{item.description}</ThemedText>
                  ) : null}
                  {item.crew_members?.length ? (
                    <ThemedText style={[styles.igCrew, { color: theme.text + '99' }]}>Crew: {item.crew_members.join(', ')}</ThemedText>
                  ) : null}
                </View>
              );
            }}
            contentContainerStyle={{ paddingBottom: 32 }}
            ListEmptyComponent={feedLoading ? <ActivityIndicator style={{ marginTop: 32 }} /> : <ThemedText style={styles.emptyText}>No logs from friends yet.</ThemedText>}
            refreshing={feedLoading}
            onRefresh={() => {
              refetchFriends();
              refetchRequests();
              queryClient.invalidateQueries({ queryKey: ["friendsFeed"] });
            }}
          />
        </View>
      )}
      {/* Manage Friends Tab */}
      {activeTab === 'manage' && (
        <View style={{ flex: 1, backgroundColor: theme.background }}>
          <TextInput
            style={[styles.searchInput, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
            placeholder="Search users by username or email"
            placeholderTextColor={theme.text + '99'}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery.trim().length > 0 && searchQuery.trim().length < 1 && (
            <ThemedText style={{ color: 'red', textAlign: 'center' }}>Enter at least 1 character to search.</ThemedText>
          )}
          {searchLoading && <ActivityIndicator style={{ marginVertical: 8 }} />}
          {searchQuery.trim().length >= 1 && !searchLoading && (
            <FlatList
              data={searchResults}
              keyExtractor={item => String(item.id)}
              renderItem={({ item }) => {
                const status = getUserFriendStatus(item);
                return (
                  <View style={{
                    backgroundColor: theme.card,
                    borderRadius: 10,
                    borderWidth: 1,
                    borderColor: theme.primary,
                    marginVertical: 6,
                    marginHorizontal: 8,
                    padding: 12,
                    shadowColor: theme.primary,
                    shadowOpacity: 0.08,
                    shadowRadius: 4,
                    shadowOffset: { width: 0, height: 2 },
                  }}>
                    <View style={{ flex: 1 }}>
                      <ThemedText style={[styles.searchResultName, { color: theme.text, fontSize: 17, fontWeight: '600' }]}>
                        {item.username || 'User'}
                      </ThemedText>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
                      {status === 'Requested' ? (
                        <>
                          <ThemedText style={[styles.actionButton, styles.actionButtonRequested, { marginRight: 8, color: theme.text }]}>Requested</ThemedText>
                          <TouchableOpacity
                            style={[styles.actionButton, { backgroundColor: '#E53935' }]}
                            disabled={cancelPendingFriendRequest.isPending}
                            onPress={() => {
                              if (item.pendingRequestId) {
                                Alert.alert(
                                  'Cancel Friend Request',
                                  'Are you sure you want to cancel this friend request?',
                                  [
                                    { text: 'No', style: 'cancel' },
                                    {
                                      text: 'Yes',
                                      style: 'destructive',
                                      onPress: () => {
                                        cancelPendingFriendRequest.mutate(item.pendingRequestId!, {
                                          onSuccess: () => {
                                            showToast('Friend request cancelled');
                                            setSearchResults(results => results.map(u => u.id === item.id ? { ...u, friendStatus: 'none', pendingRequestId: null } : u));
                                          },
                                          onError: (err: any) => {
                                            showToast(err?.message || 'Could not cancel friend request.');
                                          },
                                        });
                                      },
                                    },
                                  ]
                                );
                              }
                            }}
                          >
                            <Ionicons name="close" size={18} color="#fff" />
                          </TouchableOpacity>
                        </>
                      ) : (
                        <TouchableOpacity
                          style={[
                            styles.actionButton,
                            status === 'Add' && styles.actionButtonAdd,
                            status === 'Friends' && styles.actionButtonFriends,
                            status === 'Respond' && styles.actionButtonRespond,
                          ]}
                          disabled={status !== 'Add'}
                          onPress={() => handleSendRequest(item.username)}
                        >
                          <ThemedText style={[styles.actionButtonText, { color: '#fff' }]}>{status}</ThemedText>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                );
              }}
              ListEmptyComponent={<ThemedText style={styles.emptyText}>No users found.</ThemedText>}
              style={{ maxHeight: 200 }}
            />
          )}

          {/* Incoming Friend Requests */}
          <CollapsibleSection
            title={`Incoming Requests${incomingCount > 0 ? ` (${incomingCount})` : ''}`}
            initiallyCollapsed={!incomingOpen}
            containerStyle={{ backgroundColor: theme.card, borderRadius: 12, marginHorizontal: 8, marginTop: 8, marginBottom: 8, padding: 8 }}
          >
            {incomingRequests.length === 0 ? (
              <ThemedText style={styles.emptyText}>No incoming requests.</ThemedText>
            ) : (
              <FlatList
                data={incomingRequests}
                keyExtractor={item => String(item.id)}
                renderItem={({ item }) => (
                  <View style={styles.requestRow}>
                    <View style={{ flex: 1 }}>
                      <ThemedText style={styles.requestName}>{item.sender_details?.username || item.sender_details?.email || 'User'}</ThemedText>
                      <ThemedText style={styles.requestEmail}>{item.sender_details?.email}</ThemedText>
                    </View>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.actionButtonAdd]}
                      onPress={() => handleRespondRequest(item.id, true)}
                    >
                      <ThemedText style={styles.actionButtonText}>Accept</ThemedText>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.actionButtonRequested]}
                      onPress={() => handleRespondRequest(item.id, false)}
                    >
                      <ThemedText style={styles.actionButtonText}>Decline</ThemedText>
                    </TouchableOpacity>
                  </View>
                )}
              />
            )}
          </CollapsibleSection>

          {/* Friends List */}
          <CollapsibleSection title={`Your Friends (${friends.length})`} initiallyCollapsed={false}
            containerStyle={{ backgroundColor: theme.card, borderRadius: 12, marginHorizontal: 8, marginTop: 8, marginBottom: 8, padding: 8 }}
          >
            {friends.length === 0 ? (
              <ThemedText style={styles.emptyText}>You have no friends yet.</ThemedText>
            ) : (
              <FlatList
                data={friends}
                keyExtractor={item => String(item.id)}
                renderItem={({ item }) => (
                  <View style={{
                    backgroundColor: theme.card,
                    borderRadius: 10,
                    borderWidth: 1,
                    borderColor: theme.primary,
                    marginVertical: 6,
                    marginHorizontal: 8,
                    padding: 12,
                    shadowColor: theme.primary,
                    shadowOpacity: 0.08,
                    shadowRadius: 4,
                    shadowOffset: { width: 0, height: 2 },
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}>
                    <View style={{ flex: 1 }}>
                      <ThemedText style={[styles.friendName, { color: theme.text, fontSize: 17, fontWeight: '600' }]}>{item.username || item.name || 'Unknown User'}</ThemedText>
                    </View>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.actionButtonRemove]}
                      onPress={() => handleRemoveFriend(item.id, item.username || item.name || 'Unknown User')}
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
  container: {
    flex: 1,
    backgroundColor: 'transparent', // use theme.background in component
    paddingTop: 8,
  },
  tabSwitcher: { flexDirection: 'row', marginBottom: 8, borderBottomWidth: 1, borderColor: '#eee' },
  tabButton: { flex: 1, padding: 12, alignItems: 'center' },
  tabText: { fontSize: 16, color: '#888' },
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
  // New styles for Instagram-style card
  igCard: {
    backgroundColor: '#f7f9fc',
    borderRadius: 18,
    margin: 16,
    marginBottom: 0,
    shadowColor: '#2E66E7',
    shadowOpacity: 0.13,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
    padding: 0,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#2E66E7',
  },
  igUsername: {
    fontWeight: 'bold',
    fontSize: 18,
    padding: 14,
    paddingBottom: 0,
    color: '#2E66E7',
    letterSpacing: 0.2,
    backgroundColor: '#eaf0fa',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
  },
  igMapContainer: {
    marginTop: 8,
    marginBottom: 8,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e3e8f0',
  },
  igInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 6,
    marginTop: 2,
  },
  igBoat: {
    fontWeight: '600',
    fontSize: 15,
    color: '#222',
  },
  igBoatModel: {
    fontSize: 13,
    color: '#888',
  },
  igTime: {
    fontSize: 13,
    color: '#888',
    textAlign: 'right',
  },
  igDuration: {
    fontSize: 13,
    color: '#888',
    textAlign: 'right',
  },
  igDescription: {
    fontSize: 15,
    color: '#333',
    paddingHorizontal: 16,
    paddingBottom: 8,
    paddingTop: 2,
  },
  igCrew: {
    fontSize: 13,
    color: '#666',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
});
