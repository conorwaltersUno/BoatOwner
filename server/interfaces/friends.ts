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
    username: string | null; // Make nullable to match database
    email: string;
  };
}

// Create friend request DTO for incoming requests
export interface CreateFriendRequestDTO {
  receiver_username: string;
}

// Friend DTO for basic friend information
export interface FriendDTO {
  id: number;
  username: string | null;
  email: string;
}

// User search DTO for finding users
export interface UserSearchDTO {
  id: number;
  username: string | null;
  email: string;
}

// Friend user DTO for friend list
export interface FriendUserDTO {
  id: number;
  username: string | null; // Make nullable to match database
  // Removed email for security
  // email: string;
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
    username: string | null; // Make nullable to match database
    // Removed email for security
    // email: string;
  };
}
