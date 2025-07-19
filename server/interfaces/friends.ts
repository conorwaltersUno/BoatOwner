// Friend request DTO returned from service
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

// Friend user DTO for friend list
export interface FriendUserDTO {
  id: number;
  email: string;
  name?: string | null;
}

// Log DTO for friends' logs feed
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
  // The user who owns the log (the friend)
  user: {
    id: number;
    email: string;
  };
}
