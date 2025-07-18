# Friends Feature - Detailed Design Plan

**⚠️ IMPORTANT: This plan follows the DEVELOPMENT_RULES.md guidelines and must be implemented in the specified phases.**

---

## 🎯 FEATURE OVERVIEW

### **Objective**
Implement a friends system that allows users to:
- Create accounts with unique usernames
- Search for other users by username
- Send and receive friend requests
- View friends' logs in a dedicated section
- Maintain current log recording functionality in a separate tab

### **User Experience Changes**
1. **Sign Up/Sign In**: Add username field to registration
2. **New Tab Structure**: 
   - Move log recording to new "Add" tab
   - Create "Friends" tab with search and requests
   - Update "Home" tab with two sub-tabs: "My Logs" and "Friends Logs"

---

## 🚨 PHASE 1: PLANNING & DESIGN

### **Domain Analysis**
- **Affected Entities**: User, Logs, new Friends, new FriendRequests
- **New Relationships**: User ↔ Friends (many-to-many), User ↔ FriendRequests (one-to-many)
- **Privacy Layer**: Logs need visibility control (public/private/friends-only)

### **Database Impact**
- **Schema Changes**: Add username to user table, create friends and friend_requests tables
- **Migration Required**: Yes - 3 new migration files needed
- **Indexes**: Username (unique), friend relationships, friend requests

### **API Design**
```
New RESTful Endpoints:
POST   /friends/search           # Search users by username
POST   /friends/request          # Send friend request  
GET    /friends/requests         # Get pending requests
POST   /friends/accept           # Accept friend request
POST   /friends/reject           # Reject friend request
DELETE /friends/{friendId}       # Remove friend
GET    /friends                  # Get user's friends list
GET    /friends/logs             # Get friends' logs
```

### **UI/UX Flow**
```
1. Registration: email → password → username → boat_name → boat_model
2. New Tab Structure:
   - Add (log recording)
   - Friends (search + requests)
   - Home (My Logs + Friends Logs tabs)
   - Calendar, Expenses, Todo, Settings (unchanged)
```

### **Security Review**
- **Username uniqueness** validation
- **Friend request spam** prevention
- **Privacy controls** for log visibility
- **User search** rate limiting

---

## 🚀 PHASE 2: BACKEND IMPLEMENTATION

### **Database Migration Files**

#### **Migration 1: Add Username to User Table**
```sql
-- File: database/migrations/base/V1.16.0__add_username_to_user.sql
ALTER TABLE "user" ADD COLUMN username VARCHAR(50) UNIQUE;
CREATE INDEX idx_user_username ON "user"(username);
```

#### **Migration 2: Create Friends Table**
```sql
-- File: database/migrations/base/V1.17.0__create_friends_table.sql
CREATE TABLE friends (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    friend_id INTEGER NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, friend_id)
);
CREATE INDEX idx_friends_user_id ON friends(user_id);
CREATE INDEX idx_friends_friend_id ON friends(friend_id);
```

#### **Migration 3: Create Friend Requests Table**
```sql
-- File: database/migrations/base/V1.18.0__create_friend_requests_table.sql
CREATE TABLE friend_requests (
    id SERIAL PRIMARY KEY,
    sender_id INTEGER NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    receiver_id INTEGER NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(sender_id, receiver_id)
);
CREATE INDEX idx_friend_requests_receiver ON friend_requests(receiver_id);
CREATE INDEX idx_friend_requests_sender ON friend_requests(sender_id);
```

### **TypeScript Interfaces**

#### **Updated User Interface**
```typescript
// File: server/interfaces/user.ts
export interface UserDTO {
  id: number;
  email: string;
  password: string;
  username: string;  // NEW
  created: string;
}

export interface CreateUserDTO {
  email: string;
  password: string;
  username: string;  // NEW
  boat_name: string;
  boat_model: string;
}
```

#### **New Friends Interfaces**
```typescript
// File: server/interfaces/friends.ts
export interface FriendDTO {
  id: number;
  user_id: number;
  friend_id: number;
  created_at: string;
  friend_details: {
    id: number;
    username: string;
    email: string;
  };
}

export interface FriendRequestDTO {
  id: number;
  sender_id: number;
  receiver_id: number;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  updated_at: string;
  sender_details: {
    id: number;
    username: string;
    email: string;
  };
}

export interface CreateFriendRequestDTO {
  receiver_username: string;
}

export interface UserSearchDTO {
  id: number;
  username: string;
  email: string;
}
```

### **Service Layer Implementation**

#### **Friends Service**
```typescript
// File: server/services/friends.ts
import { prisma } from "../utilities";
import { FriendDTO, FriendRequestDTO, CreateFriendRequestDTO, UserSearchDTO } from "../interfaces/friends";

class FriendsService {
  async searchUsers(searchQuery: string, currentUserId: number): Promise<UserSearchDTO[]> {
    // Search users by username (excluding current user and existing friends)
  }

  async sendFriendRequest(senderId: number, data: CreateFriendRequestDTO): Promise<FriendRequestDTO> {
    // Send friend request with validation
  }

  async getPendingRequests(userId: number): Promise<FriendRequestDTO[]> {
    // Get pending friend requests for user
  }

  async acceptFriendRequest(requestId: number, userId: number): Promise<FriendDTO> {
    // Accept friend request and create friendship
  }

  async rejectFriendRequest(requestId: number, userId: number): Promise<boolean> {
    // Reject friend request
  }

  async removeFriend(userId: number, friendId: number): Promise<boolean> {
    // Remove friendship (both directions)
  }

  async getFriendsList(userId: number): Promise<FriendDTO[]> {
    // Get user's friends list
  }

  async getFriendsLogs(userId: number): Promise<LogDTO[]> {
    // Get logs from user's friends (with privacy checks)
  }
}

export const friendsService = new FriendsService();
```

### **Controller Layer**
```typescript
// File: server/controllers/friends.ts
import { Request, Response } from "express";
import { friendsService } from "../services/friends";
import { validationResult } from "express-validator";

export async function searchUsers(req: Request, res: Response) {
  // Handle user search with validation
}

export async function sendFriendRequest(req: Request, res: Response) {
  // Handle friend request sending
}

export async function getPendingRequests(req: Request, res: Response) {
  // Handle getting pending requests
}

export async function acceptFriendRequest(req: Request, res: Response) {
  // Handle accepting friend request
}

export async function rejectFriendRequest(req: Request, res: Response) {
  // Handle rejecting friend request
}

export async function removeFriend(req: Request, res: Response) {
  // Handle removing friend
}

export async function getFriendsList(req: Request, res: Response) {
  // Handle getting friends list
}

export async function getFriendsLogs(req: Request, res: Response) {
  // Handle getting friends' logs
}
```

### **Router Configuration**
```typescript
// File: server/routers/friends.ts
import express from "express";
import { body } from "express-validator";
import { expressValidator } from "../middleware/expressValidator";
import * as friendsController from "../controllers/friends";

const router = express.Router();

router.post(
  "/search",
  body("query").isLength({ min: 2 }).withMessage("Search query must be at least 2 characters"),
  expressValidator,
  friendsController.searchUsers
);

router.post(
  "/request",
  body("receiver_username").isLength({ min: 3 }).withMessage("Username must be at least 3 characters"),
  expressValidator,
  friendsController.sendFriendRequest
);

router.get("/requests", friendsController.getPendingRequests);
router.post("/accept/:requestId", friendsController.acceptFriendRequest);
router.post("/reject/:requestId", friendsController.rejectFriendRequest);
router.delete("/:friendId", friendsController.removeFriend);
router.get("/", friendsController.getFriendsList);
router.get("/logs", friendsController.getFriendsLogs);

export { router as FriendsRouter };
```

### **Updated User Service**
```typescript
// File: server/services/users.ts (additions)
async function createUser(data: CreateUserDTO): Promise<{ UserDTO; BoatDTO }> {
  // Add username validation and creation
  const existingUser = await prisma.user.findUnique({
    where: { username: data.username }
  });
  
  if (existingUser) {
    throw new Error("Username already exists");
  }
  
  const newUser = await prisma.user.create({
    data: {
      email: data.email,
      password: data.password,
      username: data.username,  // NEW
      created: dayjs().format(),
    },
  });
  // ... rest of existing logic
}

async function getUserByUsername(username: string): Promise<UserDTO | null> {
  // New function to find user by username
}
```

### **Middleware Updates**
```typescript
// File: server/middleware/auth.ts (additions)
// Add rate limiting for user search
// Add validation for username format
```

---

## 🎨 PHASE 3: FRONTEND IMPLEMENTATION

### **TypeScript Interfaces**
```typescript
// File: ui/mobile/BoatOwner/interfaces/friends.ts
export interface FriendDTO {
  id: number;
  user_id: number;
  friend_id: number;
  created_at: string;
  friend_details: {
    id: number;
    username: string;
    email: string;
  };
}

export interface FriendRequestDTO {
  id: number;
  sender_id: number;
  receiver_id: number;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  updated_at: string;
  sender_details: {
    id: number;
    username: string;
    email: string;
  };
}

export interface UserSearchResult {
  id: number;
  username: string;
  email: string;
}
```

### **API Integration**
```typescript
// File: ui/mobile/BoatOwner/api/fetch/friends.fetch.ts
import { authFetch } from '@/utils/authFetch';
import { APIRoutes } from '@/constants/APIRoutes';

export async function searchUsers(query: string): Promise<UserSearchResult[]> {
  const response = await authFetch(`${APIRoutes.friends}/search`, {
    method: 'POST',
    body: JSON.stringify({ query }),
  });
  return response.json();
}

export async function sendFriendRequest(receiver_username: string): Promise<FriendRequestDTO> {
  const response = await authFetch(`${APIRoutes.friends}/request`, {
    method: 'POST',
    body: JSON.stringify({ receiver_username }),
  });
  return response.json();
}

export async function getPendingRequests(): Promise<FriendRequestDTO[]> {
  const response = await authFetch(`${APIRoutes.friends}/requests`);
  return response.json();
}

export async function acceptFriendRequest(requestId: number): Promise<FriendDTO> {
  const response = await authFetch(`${APIRoutes.friends}/accept/${requestId}`, {
    method: 'POST',
  });
  return response.json();
}

export async function rejectFriendRequest(requestId: number): Promise<void> {
  await authFetch(`${APIRoutes.friends}/reject/${requestId}`, {
    method: 'POST',
  });
}

export async function getFriendsList(): Promise<FriendDTO[]> {
  const response = await authFetch(`${APIRoutes.friends}`);
  return response.json();
}

export async function getFriendsLogs(): Promise<LogDTO[]> {
  const response = await authFetch(`${APIRoutes.friends}/logs`);
  return response.json();
}

export async function removeFriend(friendId: number): Promise<void> {
  await authFetch(`${APIRoutes.friends}/${friendId}`, {
    method: 'DELETE',
  });
}
```

### **Custom Hooks**
```typescript
// File: ui/mobile/BoatOwner/hooks/useFriends.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/constants/query';
import * as friendsApi from '@/api/fetch/friends.fetch';

export function useSearchUsers(query: string) {
  return useQuery({
    queryKey: [QUERY_KEYS.SEARCH_USERS, query],
    queryFn: () => friendsApi.searchUsers(query),
    enabled: query.length > 0,
  });
}

export function useSendFriendRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: friendsApi.sendFriendRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PENDING_REQUESTS] });
    },
  });
}

export function usePendingRequests() {
  return useQuery({
    queryKey: [QUERY_KEYS.PENDING_REQUESTS],
    queryFn: friendsApi.getPendingRequests,
  });
}

export function useAcceptFriendRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: friendsApi.acceptFriendRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PENDING_REQUESTS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.FRIENDS_LIST] });
    },
  });
}

export function useRejectFriendRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: friendsApi.rejectFriendRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PENDING_REQUESTS] });
    },
  });
}

export function useFriendsList() {
  return useQuery({
    queryKey: [QUERY_KEYS.FRIENDS_LIST],
    queryFn: friendsApi.getFriendsList,
  });
}

export function useFriendsLogs() {
  return useQuery({
    queryKey: [QUERY_KEYS.FRIENDS_LOGS],
    queryFn: friendsApi.getFriendsLogs,
  });
}

export function useRemoveFriend() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: friendsApi.removeFriend,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.FRIENDS_LIST] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.FRIENDS_LOGS] });
    },
  });
}
```

### **Updated Sign Up Form**
```typescript
// File: ui/mobile/BoatOwner/app/(auth)/SignUp.tsx (modifications)
export default function SignUpScreen({ navigation }: SignUpScreenProps) {
  const [form, setForm] = useState({ 
    email: "", 
    password: "", 
    username: "",  // NEW
    boat_name: "", 
    boat_model: "" 
  });

  return (
    <View style={styles.container}>
      {/* ...existing code... */}
      
      <TextInput
        placeholder="Email"
        value={form.email}
        onChangeText={(email) => setForm((f) => ({ ...f, email }))}
        style={styles.input}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      
      <TextInput
        placeholder="Username"
        value={form.username}
        onChangeText={(username) => setForm((f) => ({ ...f, username }))}
        style={styles.input}
        autoCapitalize="none"
      />
      
      <TextInput
        placeholder="Password"
        value={form.password}
        onChangeText={(password) => setForm((f) => ({ ...f, password }))}
        secureTextEntry
        style={styles.input}
      />
      
      {/* ...existing boat fields... */}
    </View>
  );
}
```

### **New Tab Structure**
```typescript
// File: ui/mobile/BoatOwner/app/(tabs)/_layout.tsx
export default function TabLayout() {
  return (
    <Tabs>
      <Tabs.Screen
        name="todo"
        options={{
          title: "Todo's",
          tabBarIcon: ({ color, size }) => <FontAwesome name="sort-amount-asc" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="expenses"
        options={{
          title: "Expenses",
          tabBarIcon: ({ color, size }) => <FontAwesome name="dollar" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="add"  // NEW - moved from home
        options={{
          title: "Add",
          tabBarIcon: ({ color, size }) => <Ionicons name="add-circle" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="friends"  // NEW
        options={{
          title: "Friends",
          tabBarIcon: ({ color, size }) => <Ionicons name="people" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="(home)"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => <Ionicons name="home" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: "Calendar",
          tabBarIcon: ({ color, size }) => <Ionicons name="calendar" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, size }) => <Ionicons name="settings" color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
```

### **New Add Tab (Log Recording)**
```typescript
// File: ui/mobile/BoatOwner/app/(tabs)/add.tsx
import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Alert, TouchableOpacity, Text } from 'react-native';
import MapView, { Marker, Polyline, Region } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { SaveLogModal } from '@/components/SaveLogModal';

export default function AddScreen() {
  // Move all log recording functionality from home/index.tsx here
  const mapRef = useRef<MapView>(null);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [watcher, setWatcher] = useState<Location.LocationSubscription | null>(null);
  const [region, setRegion] = useState<Region | null>(null);
  const [startTime, setStartTime] = useState<Date | null>(null);
  // ... all existing log recording logic

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        region={region}
        showsUserLocation={true}
        followsUserLocation={true}
      >
        {/* Map markers and polylines */}
      </MapView>
      
      {/* Control buttons */}
      <View style={styles.controlPanel}>
        {/* Log recording controls */}
      </View>
      
      {/* Save log modal */}
      <SaveLogModal
        modalVisibility={isModalVisible}
        setModalVisibility={setModalVisible}
        logData={logData}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  controlPanel: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // ... other styles
});
```

### **New Friends Tab**
```typescript
// File: ui/mobile/BoatOwner/app/(tabs)/friends.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { 
  useSearchUsers, 
  usePendingRequests, 
  useSendFriendRequest, 
  useAcceptFriendRequest, 
  useRejectFriendRequest 
} from '@/hooks/useFriends';

export default function FriendsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const { data: searchResults = [] } = useSearchUsers(searchQuery);
  const { data: pendingRequests = [] } = usePendingRequests();
  const { mutate: sendRequest } = useSendFriendRequest();
  const { mutate: acceptRequest } = useAcceptFriendRequest();
  const { mutate: rejectRequest } = useRejectFriendRequest();

  const handleSendRequest = (username: string) => {
    sendRequest(username, {
      onSuccess: () => Alert.alert('Success', 'Friend request sent!'),
      onError: (error) => Alert.alert('Error', error.message),
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
      <Text style={styles.title}>Friends</Text>
      
      {/* Search Section */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search users by username..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <Ionicons name="search" size={24} color="#666" />
      </View>

      {/* Search Results */}
      {searchQuery.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Search Results</Text>
          <FlatList
            data={searchResults}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <View style={styles.userItem}>
                <Text style={styles.username}>{item.username}</Text>
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={() => handleSendRequest(item.username)}
                >
                  <Ionicons name="person-add" size={20} color="#fff" />
                </TouchableOpacity>
              </View>
            )}
          />
        </View>
      )}

      {/* Pending Requests */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Friend Requests</Text>
        <FlatList
          data={pendingRequests}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.requestItem}>
              <Text style={styles.username}>{item.sender_details.username}</Text>
              <View style={styles.requestActions}>
                <TouchableOpacity
                  style={styles.acceptButton}
                  onPress={() => handleAcceptRequest(item.id)}
                >
                  <Ionicons name="checkmark" size={20} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.rejectButton}
                  onPress={() => handleRejectRequest(item.id)}
                >
                  <Ionicons name="close" size={20} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          )}
          ListEmptyComponent={<Text style={styles.emptyText}>No pending requests</Text>}
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
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2E66E7',
    marginBottom: 20,
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
  },
  requestItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
  },
  username: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  addButton: {
    backgroundColor: '#2E66E7',
    borderRadius: 20,
    padding: 8,
  },
  requestActions: {
    flexDirection: 'row',
    gap: 10,
  },
  acceptButton: {
    backgroundColor: '#34C759',
    borderRadius: 20,
    padding: 8,
  },
  rejectButton: {
    backgroundColor: '#FF3B30',
    borderRadius: 20,
    padding: 8,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
  },
});
```

### **Updated Home Tab with Sub-tabs**
```typescript
// File: ui/mobile/BoatOwner/app/(tabs)/(home)/index.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ScrollView } from 'react-native';
import { useGetLogs } from '@/hooks/index';
import { useFriendsLogs } from '@/hooks/useFriends';
import { LogDetailModal } from '@/components/LogDetailModal';

export default function HomeScreen() {
  const [activeTab, setActiveTab] = useState<'my-logs' | 'friends-logs'>('my-logs');
  const [selectedLog, setSelectedLog] = useState(null);
  const [isModalVisible, setModalVisible] = useState(false);

  const { data: myLogs = [], isLoading: myLogsLoading } = useGetLogs();
  const { data: friendsLogs = [], isLoading: friendsLogsLoading } = useFriendsLogs();

  const handleLogPress = (log: any) => {
    setSelectedLog(log);
    setModalVisible(true);
  };

  const renderLogItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.logItem}
      onPress={() => handleLogPress(item)}
    >
      <View style={styles.logHeader}>
        <Text style={styles.logTitle}>
          {activeTab === 'friends-logs' ? `${item.user?.username}: ` : ''}
          {item.description || 'Unnamed Log'}
        </Text>
        <Text style={styles.logDate}>
          {new Date(item.log_started || item.created_on).toLocaleDateString()}
        </Text>
      </View>
      <Text style={styles.logDetails}>
        {item.crew_members?.length || 0} crew • {item.coordinates?.length || 0} points
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Logs</Text>
      
      {/* Tab Selector */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'my-logs' && styles.activeTab]}
          onPress={() => setActiveTab('my-logs')}
        >
          <Text style={[styles.tabText, activeTab === 'my-logs' && styles.activeTabText]}>
            My Logs
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'friends-logs' && styles.activeTab]}
          onPress={() => setActiveTab('friends-logs')}
        >
          <Text style={[styles.tabText, activeTab === 'friends-logs' && styles.activeTabText]}>
            Friends Logs
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {activeTab === 'my-logs' ? (
          <FlatList
            data={myLogs}
            renderItem={renderLogItem}
            keyExtractor={(item) => item.id.toString()}
            refreshing={myLogsLoading}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No logs yet. Start recording your first log!</Text>
            }
          />
        ) : (
          <FlatList
            data={friendsLogs}
            renderItem={renderLogItem}
            keyExtractor={(item) => `${item.id}-${item.user?.id}`}
            refreshing={friendsLogsLoading}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No friends logs yet. Add friends to see their logs!</Text>
            }
          />
        )}
      </View>

      {/* Log Detail Modal */}
      {selectedLog && (
        <LogDetailModal
          modalVisibility={isModalVisible}
          setModalVisibility={setModalVisible}
          log={selectedLog}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2E66E7',
    marginBottom: 20,
    textAlign: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 4,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeTab: {
    backgroundColor: '#2E66E7',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
  },
  activeTabText: {
    color: '#fff',
  },
  content: {
    flex: 1,
  },
  logItem: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  logTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  logDate: {
    fontSize: 14,
    color: '#666',
  },
  logDetails: {
    fontSize: 14,
    color: '#888',
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
    marginTop: 50,
  },
});
```

---

## 🔧 PHASE 4: INTEGRATION & DEPLOYMENT

### **Testing Strategy**
1. **Unit Tests**: All services and controllers
2. **Integration Tests**: API endpoints with authentication
3. **Frontend Tests**: Components and hooks
4. **E2E Tests**: Complete friend request flow

### **Migration Testing**
1. **Backup database** before migration
2. **Test migration** in development environment
3. **Verify data integrity** after migration
4. **Test rollback** procedures

### **Performance Considerations**
1. **Database indexes** on username and friend relationships
2. **Query optimization** for friends' logs
3. **Pagination** for large friend lists
4. **Rate limiting** for search functionality

### **Security Measures**
1. **Username uniqueness** validation
2. **Friend request** spam prevention
3. **Privacy controls** for log visibility
4. **Input sanitization** for search queries

---

## 📋 DEPLOYMENT CHECKLIST

### **Pre-Deployment**
- [ ] All database migrations tested
- [ ] All new API endpoints documented in Swagger
- [ ] All tests passing (backend and frontend)
- [ ] Code review completed
- [ ] Performance impact assessed
- [ ] Security review completed

### **Deployment Steps**
1. **Deploy database migrations** to staging
2. **Deploy backend** with new endpoints
3. **Deploy frontend** with new UI
4. **Test end-to-end** functionality
5. **Monitor** for errors and performance

### **Post-Deployment**
- [ ] Monitor database performance
- [ ] Check API response times
- [ ] Verify friend request notifications
- [ ] Test user search functionality
- [ ] Validate log privacy settings

---

## 🚀 FUTURE ENHANCEMENTS

### **Phase 2 Features**
1. **Push notifications** for friend requests
2. **Log privacy settings** (public, private, friends-only)
3. **Friend activity feed** with recent logs
4. **Mutual friends** display
5. **Block/unblock** functionality

### **Phase 3 Features**
1. **Friend groups** and collections
2. **Log sharing** with specific friends
3. **Collaborative logs** with multiple users
4. **Friend location sharing** (optional)
5. **Social features** (comments, likes on logs)

---

**This design plan follows the DEVELOPMENT_RULES.md guidelines and ensures a robust, scalable friends feature implementation.**

**🚢 Ready to set sail with friends!**
