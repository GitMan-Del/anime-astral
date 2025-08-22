'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';

interface Friend {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string;
  friendship_id: string;
  friends_since: string;
}

interface FriendRequest {
  id: string;
  sender: {
    id: string;
    username: string;
    display_name: string;
    avatar_url: string;
  };
  created_at: string;
}

export default function FriendSystem() {
  const { data: session } = useSession();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [friendCode, setFriendCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'friends' | 'requests' | 'add'>('friends');

  useEffect(() => {
    if (session?.user?.id) {
      fetchFriends();
      fetchRequests();
    }
  }, [session]);

  const fetchFriends = async () => {
    try {
      const response = await fetch('/api/friends');
      const data = await response.json();
      if (response.ok) {
        setFriends(data.friends || []);
      }
    } catch {
      console.error('Error fetching friends');
    }
  };

  const fetchRequests = async () => {
    try {
      const response = await fetch('/api/friends/requests');
      const data = await response.json();
      if (response.ok) {
        setRequests(data.requests || []);
      }
    } catch {
      console.error('Error fetching requests');
    }
  };

  const sendFriendRequest = async () => {
    if (!friendCode.trim()) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/friends/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ friend_code: friendCode.trim() })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setMessage('Friend request sent successfully!');
        setFriendCode('');
        setActiveTab('requests');
      } else {
        setMessage(data.error || 'Failed to send friend request');
      }
    } catch {
      setMessage('Error sending friend request');
    } finally {
      setLoading(false);
    }
  };

  const handleFriendRequest = async (requestId: string, action: 'accept' | 'reject') => {
    try {
      const response = await fetch(`/api/friends/requests/${requestId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });
      
      if (response.ok) {
        setMessage(`Friend request ${action}ed successfully!`);
        fetchRequests();
        fetchFriends();
        setActiveTab('friends');
      }
    } catch {
      setMessage(`Error ${action}ing friend request`);
    }
  };

  const deleteFriendRequest = async (requestId: string) => {
    try {
      const response = await fetch(`/api/friends/requests/${requestId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        setMessage('Friend request deleted successfully!');
        fetchRequests();
      }
    } catch {
      setMessage('Error deleting friend request');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-3xl font-bold mb-8 text-center text-gray-800">Friends System</h2>
      
      {/* Tab Navigation */}
      <div className="flex justify-center mb-8">
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('friends')}
            className={`px-6 py-2 rounded-md transition-colors ${
              activeTab === 'friends' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Friends ({friends.length})
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`px-6 py-2 rounded-md transition-colors ${
              activeTab === 'requests' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Requests ({requests.length})
          </button>
          <button
            onClick={() => setActiveTab('add')}
            className={`px-6 py-2 rounded-md transition-colors ${
              activeTab === 'add' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Add Friend
          </button>
        </div>
      </div>

      {/* Message Display */}
      {message && (
        <div className={`mb-6 p-4 rounded-lg ${
          message.includes('Error') 
            ? 'bg-red-50 text-red-700 border border-red-200' 
            : 'bg-green-50 text-green-700 border border-green-200'
        }`}>
          {message}
        </div>
      )}

      {/* Add Friend Section */}
      {activeTab === 'add' && (
        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
          <h3 className="text-2xl font-semibold mb-6 text-gray-800">Add New Friend</h3>
          <div className="max-w-md">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Friend Code
            </label>
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Enter friend code (e.g., #1234)"
                value={friendCode}
                onChange={(e) => setFriendCode(e.target.value)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={sendFriendRequest}
                disabled={loading || !friendCode.trim()}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {loading ? 'Sending...' : 'Send Request'}
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Ask your friend for their unique friend code to send them a request.
            </p>
          </div>
        </div>
      )}

      {/* Friend Requests */}
      {activeTab === 'requests' && (
        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
          <h3 className="text-2xl font-semibold mb-6 text-gray-800">
            Friend Requests ({requests.length})
          </h3>
          {requests.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📭</div>
              <p className="text-gray-500 text-lg">No pending friend requests</p>
              <p className="text-gray-400">When someone sends you a friend request, it will appear here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((request) => (
                <div key={request.id} className="flex items-center justify-between p-6 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <Image
                      src={request.sender.avatar_url || '/default-profile.png'}
                      alt={request.sender.display_name}
                      width={64}
                      height={64}
                      className="rounded-full object-cover border-2 border-gray-200"
                    />
                    <div>
                      <p className="font-semibold text-lg text-gray-800">{request.sender.display_name}</p>
                      <p className="text-gray-600">@{request.sender.username}</p>
                      <p className="text-sm text-gray-500">
                        Sent {new Date(request.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleFriendRequest(request.id, 'accept')}
                      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleFriendRequest(request.id, 'reject')}
                      className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => deleteFriendRequest(request.id)}
                      className="px-4 py-2 text-gray-500 hover:text-red-600 transition-colors"
                      title="Delete request"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Friends List */}
      {activeTab === 'friends' && (
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h3 className="text-2xl font-semibold mb-6 text-gray-800">
            Your Friends ({friends.length})
          </h3>
          {friends.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">👥</div>
              <p className="text-gray-500 text-lg">No friends yet</p>
              <p className="text-gray-400 mb-6">Start building your friend list by sending friend requests!</p>
              <button
                onClick={() => setActiveTab('add')}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Add Your First Friend
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {friends.map((friend) => (
                <div key={friend.friendship_id} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                  <div className="text-center">
                    <Image
                      src={friend.avatar_url || '/default-profile.png'}
                      alt={friend.display_name}
                      width={80}
                      height={80}
                      className="rounded-full mx-auto mb-4 object-cover border-2 border-gray-200"
                    />
                    <h4 className="font-semibold text-lg text-gray-800 mb-1">{friend.display_name}</h4>
                    <p className="text-gray-600 mb-3">@{friend.username}</p>
                    <div className="text-xs text-gray-500 bg-gray-100 rounded-full px-3 py-1 inline-block">
                      Friends since {new Date(friend.friends_since).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
