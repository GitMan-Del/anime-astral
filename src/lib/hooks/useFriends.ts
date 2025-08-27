import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';

export interface Friend {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  friend_code: string | null;
  created_at: string;
}

export interface FriendRequest {
  id: string;
  sender_id: string;
  receiver_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  sender?: Friend;
  receiver?: Friend;
}

export interface Friendship {
  friendship_id: string;
  friend: Friend;
  friends_since: string;
}

export function useFriends() {
  const { data: session } = useSession();
  const [friends, setFriends] = useState<Friendship[]>([]);
  const [receivedRequests, setReceivedRequests] = useState<FriendRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const userId = session?.user?.id;

  // Obține lista de prieteni
  const fetchFriends = useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/friends/list?userId=${userId}`);
      const data = await response.json();

      if (response.ok) {
        setFriends(data.friends);
      } else {
        setError(data.error || 'Failed to fetch friends');
      }
    } catch (err) {
      setError(err + 'Failed to fetch friends');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Obține cererile de prietenie
  const fetchFriendRequests = useCallback(async () => {
    if (!userId) return;

    try {
      const response = await fetch(`/api/friends/requests?userId=${userId}`);
      const data = await response.json();

      if (response.ok) {
        setReceivedRequests(data.received);
        setSentRequests(data.sent);
      } else {
        setError(data.error || 'Failed to fetch friend requests');
      }
    } catch (err) {
      setError( err + 'Failed to fetch friend requests');
    }
  }, [userId]);

  // Trimite o cerere de prietenie
  const sendFriendRequest = useCallback(async (receiverId: string) => {
    if (!userId) return false;

    try {
      const response = await fetch('/api/friends/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ senderId: userId, receiverId }),
      });

      const data = await response.json();

      if (response.ok) {
        // Reîmprospătează cererile
        await fetchFriendRequests();
        return true;
      } else {
        setError(data.error || 'Failed to send friend request');
        return false;
      }
    } catch (err) {
      setError(err + 'Failed to send friend request');
      return false;
    }
  }, [userId, fetchFriendRequests]);

  // Răspunde la o cerere de prietenie
  const respondToFriendRequest = useCallback(async (requestId: string, status: 'accepted' | 'rejected') => {
    if (!userId) return false;

    try {
      const response = await fetch('/api/friends/requests', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId, status, userId }),
      });

      const data = await response.json();

      if (response.ok) {
        // Reîmprospătează cererile și prietenii
        await Promise.all([fetchFriendRequests(), fetchFriends()]);
        return true;
      } else {
        setError(data.error || 'Failed to respond to friend request');
        return false;
      }
    } catch (err) {
      setError(err + 'Failed to respond to friend request');
      return false;
    }
  }, [userId, fetchFriendRequests, fetchFriends]);

  // Caută un utilizator după friend code
  const searchUserByFriendCode = useCallback(async (friendCode: string): Promise<Friend | null> => {
    try {
      const response = await fetch(`/api/users/search?code=${encodeURIComponent(friendCode)}`);
      const data = await response.json();

      if (response.ok) {
        return data.user;
      } else {
        setError(data.error || 'User not found');
        return null;
      }
    } catch (err) {
      setError( err + 'Failed to search user');
      return null;
    }
  }, []);

  // Generează un friend code nou
  const generateNewFriendCode = useCallback(async () => {
    if (!userId) return null;

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      const data = await response.json();

      if (response.ok) {
        return data.friend_code;
      } else {
        setError(data.error || 'Failed to generate friend code');
        return null;
      }
    } catch (err) {
      setError(err + 'Failed to generate friend code');
      return null;
    }
  }, [userId]);

  // Încarcă datele la montarea componentei
  useEffect(() => {
    if (userId) {
      fetchFriends();
      fetchFriendRequests();
    }
  }, [userId, fetchFriends, fetchFriendRequests]);

  return {
    friends,
    receivedRequests,
    sentRequests,
    loading,
    error,
    sendFriendRequest,
    respondToFriendRequest,
    searchUserByFriendCode,
    generateNewFriendCode,
    refreshFriends: fetchFriends,
    refreshRequests: fetchFriendRequests,
  };
}
