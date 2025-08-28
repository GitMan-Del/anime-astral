export interface User {
  id: string;
  email: string;
  password_hash: string | null;
  avatar_url: string | null;
  auth_provider: 'credentials' | 'google';
  email_verified: boolean;
  created_at: string;
  updated_at: string;
  is_admin: boolean | null;
  username: string | null;
  friend_code: string | null;
  display_name: string | null;
}

export interface FriendRequest {
  id: string;
  sender_id: string;
  receiver_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  updated_at: string;
}

export interface Friendship {
  id: string;
  user1_id: string;
  user2_id: string;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      users: {
        Row: User;
        Insert: Omit<User, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<User, 'id' | 'created_at' | 'updated_at'>>;
      };
      friend_requests: {
        Row: FriendRequest;
        Insert: Omit<FriendRequest, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<FriendRequest, 'id' | 'created_at' | 'updated_at'>>;
      };
      friendships: {
        Row: Friendship;
        Insert: Omit<Friendship, 'id' | 'created_at'>;
        Update: Partial<Omit<Friendship, 'id' | 'created_at'>>;
      };
    };
    Functions: {
      generate_unique_friend_code: {
        Returns: string;
      };
      are_friends: {
        Args: { user1_uuid: string; user2_uuid: string };
        Returns: boolean;
      };
      get_user_friends: {
        Args: { user_uuid: string };
        Returns: {
          friend_id: string;
          username: string | null;
          display_name: string | null;
          avatar_url: string | null;
          friendship_id: string;
          friends_since: string;
        }[];
      };
    };
  };
}