// TypeScript interfaces for Friends feature

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
  friendStatus?: 'pending' | 'incoming' | 'none';
  pendingRequestId?: number | null;
}
