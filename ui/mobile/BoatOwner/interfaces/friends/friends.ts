export interface FriendUserDTO {
  id: number;
  username: string;
  name?: string | null;
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

export interface FriendsLogDTO {
  id: number;
  boat_id: number;
  description: string;
  crew_members: string[];
  coordinates: any[];
  log_started: string;
  log_ended: string;
  created_on: string;
  boat: {
    name: string;
    model: string;
  };
  user: {
    id: number;
    username: string;
    name?: string | null;
  };
}
