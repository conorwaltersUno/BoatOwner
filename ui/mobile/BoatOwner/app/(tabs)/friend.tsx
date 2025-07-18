import React, { useState } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSearchUsers, useSendFriendRequest, usePendingRequests, useAcceptFriendRequest, useRejectFriendRequest, useFriendsList, useFriendsLogs } from '@/hooks/useFriends';
import { LogDTO } from '@/interfaces/log/log';
import LogDetailModal from '@/components/LogDetailModal';
import LogRouteMapWithReplay from '@/components/LogRouteMapWithReplay';

export default function Friend() {
  const [activeTab, setActiveTab] = useState<'logs' | 'manage'>('logs');
  const [searchQuery, setSearchQuery] = useState('');
  const { data: searchResults, isLoading: searchLoading, error: searchError } = useSearchUsers(searchQuery);
  const { mutate: sendRequest, isPending: sending } = useSendFriendRequest();
  const { data: pendingRequests, isLoading: pendingLoading, error: pendingError } = usePendingRequests();
  const { mutate: acceptRequest } = useAcceptFriendRequest();
  const { mutate: rejectRequest } = useRejectFriendRequest();
  const { data: friendsList, isLoading: friendsLoading, error: friendsError } = useFriendsList();
  const { data: friendsLogs = [], isLoading: logsLoading, error: logsError } = useFriendsLogs();
  const [selectedLog, setSelectedLog] = useState<LogDTO | null>(null);
  const [isLogModalVisible, setLogModalVisible] = useState(false);

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
      {/* Tab Switcher */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'logs' && styles.tabButtonActive]}
          onPress={() => setActiveTab('logs')}
        >
          <Text style={[styles.tabText, activeTab === 'logs' && styles.tabTextActive]}>Friends' Logs</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'manage' && styles.tabButtonActive]}
          onPress={() => setActiveTab('manage')}
        >
          <Text style={[styles.tabText, activeTab === 'manage' && styles.tabTextActive]}>Manage Friends</Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      {activeTab === 'logs' ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Friends' Logs</Text>
          {logsLoading && <ActivityIndicator />}
          {logsError && <Text style={styles.errorText}>Error loading friends' logs</Text>}
          <FlatList
            data={friendsLogs}
            keyExtractor={item => item.id.toString()}
            renderItem={({ item }) => {
              console.log('Rendering log item:', item);
              // --- FRIENDS_LOGS_FIX: Robustly extract user and boat info for display ---
              // This logic tries multiple possible fields for user and boat info to handle various backend response shapes.
              // User: tries owner, user, friend, friend_details, username fields in order.
              // Boat: tries boat.name/model, boat_name, boat_model, and falls back to boat ID or 'Unknown'.
              // This ensures the UI always displays the most accurate info available, and never shows 'Unknown User' unless all options are missing.
              const user =
                item.owner?.username ? item.owner :
                item.user?.username ? item.user :
                item.friend?.username ? item.friend :
                item.friend_details?.username ? item.friend_details :
                item.username ? { username: item.username } :
                {};
              const boat =
                item.boat?.name || item.boat?.model ? item.boat :
                (item.boat_name || item.boat_model) ? { name: item.boat_name, model: item.boat_model } :
                null;
              const boatName = boat?.name || item.boat_name || item.boatName || null;
              const boatModel = boat?.model || item.boat_model || item.boatModel || null;
              const boatId = item.boat_id || item.boatId || null;
              // Remove unused variable lint warning by using default for user
              const username = user.username || 'Unknown User';
              return (
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => { setSelectedLog(item); setLogModalVisible(true); }}
                  style={styles.logCard}
                >
                  {/* User Info (Top) */}
                  <View style={styles.logUserRow}>
                    <View style={styles.avatarCircleLarge}>
                      <Text style={styles.avatarTextLarge}>{username[0]?.toUpperCase() || '?'}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.logUsername}>{username}</Text>
                    </View>
                  </View>
                  {/* Log Content (Middle): Route Map with Replay */}
                  <LogRouteMapWithReplay log={item} height={180} showReplayControls onMapPress={() => { setSelectedLog(item); setLogModalVisible(true); }} />
                  {/* Log Meta (Bottom) */}
                  <View style={styles.logMetaRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.logMetaText}>
                        <Text style={{ fontWeight: 'bold', color: '#2E66E7' }}>User: </Text>
                        {username}
                      </Text>
                      <Text style={styles.logMetaText}>
                        <Text style={{ fontWeight: 'bold', color: '#2E66E7' }}>Boat: </Text>
                        {boatName ? boatName : boatId ? `ID ${boatId}` : 'Unknown'}
                        {boatModel ? `  •  ${boatModel}` : ''}
                      </Text>
                      <Text style={styles.logMetaText}>
                        <Text style={{ fontWeight: 'bold', color: '#2E66E7' }}>Start: </Text>
                        {item.log_started ? new Date(item.log_started).toLocaleString() : 'N/A'}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            }}
            ListEmptyComponent={!logsLoading ? <Text style={styles.emptyText}>No friends' logs yet.</Text> : null}
          />
          {selectedLog && (
            <LogDetailModal
              modalVisibility={isLogModalVisible}
              setModalVisibility={setLogModalVisible}
              log={selectedLog}
            />
          )}
        </View>
      ) : (
        <View>
          {/* Search Users */}
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
      )}
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
  avatarCircleLarge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#e0e7ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  avatarTextLarge: {
    fontWeight: 'bold',
    fontSize: 22,
    color: '#2E66E7',
  },
  logCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 22,
    padding: 0,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  logUserRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  logUsername: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E66E7',
  },
  logMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    backgroundColor: '#f7f7fa',
  },
  logMetaText: {
    fontSize: 13,
    color: '#888',
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 18,
    backgroundColor: '#e0e7ff',
    borderRadius: 24,
    overflow: 'hidden',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  tabButtonActive: {
    backgroundColor: '#2E66E7',
  },
  tabText: {
    fontSize: 16,
    color: '#2E66E7',
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#fff',
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
  addButton: {
    backgroundColor: '#2E66E7',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 18,
    marginLeft: 10,
    alignItems: 'center',
    justifyContent: 'center',
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
    backgroundColor: '#2ecc71',
    borderRadius: 8,
    padding: 8,
    marginLeft: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rejectButton: {
    backgroundColor: '#e74c3c',
    borderRadius: 8,
    padding: 8,
    marginLeft: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E66E7',
  },
  email: {
    fontSize: 13,
    color: '#888',
  },
});
