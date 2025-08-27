"use client";

import Sidebar from "../../components/Sidebar";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import Header from "../../components/Header";
import { useState } from "react";
import { useFriends } from "../../../lib/hooks/useFriends";
import UserCard from "../../components/UserCard";
import { Friend } from "../../../lib/hooks/useFriends";

// Extinde tipul session pentru a include friend_code
interface ExtendedUser {
  id: string;
  email: string;
  name?: string;
  image?: string;
  friend_code?: string;
  username?: string;
  display_name?: string;
}

export default function FriendsPage() {
  const { data: session } = useSession();
  const [searchCode, setSearchCode] = useState("");
  const [searchResult, setSearchResult] = useState<Friend | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'friends' | 'requests' | 'search'>('friends');
  
  if (!session?.user) {
    redirect("/");
  }

  const {
    friends,
    receivedRequests,
    sentRequests,
    loading,
    error,
    sendFriendRequest,
    respondToFriendRequest,
    searchUserByFriendCode,
    generateNewFriendCode,
  } = useFriends();

  const handleSearch = async () => {
    if (!searchCode.trim()) return;

    setSearchLoading(true);
    setSearchResult(null);

    try {
      const user = await searchUserByFriendCode(searchCode.trim());
      setSearchResult(user);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSendRequest = async (userId: string) => {
    const success = await sendFriendRequest(userId);
    if (success) {
      setSearchResult(null);
      setSearchCode("");
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    await respondToFriendRequest(requestId, 'accepted');
  };

  const handleRejectRequest = async (requestId: string) => {
    await respondToFriendRequest(requestId, 'rejected');
  };

  return (
    <div className="bg-[#0F0F0F] flex h-screen">
      {/* Sidebar în stânga */}
      <div>
        <Sidebar />
      </div>
    
      {/* Container pentru Header și conținut */}
      <div className="flex-1 flex flex-col">
        {/* Header sus */}
        <div className="h-fit">
          <Header />
        </div>
    
        {/* Conținutul friends system */}
        <div className="flex-1 overflow-y-auto bg-[#0F0F0F] p-6">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">Friends System</h1>
              <p className="text-gray-400">Manage your friends and connections</p>
            </div>

            {/* Tabs */}
            <div className="flex space-x-1 mb-6 bg-[#1A1A1A] rounded-lg p-1">
              <button
                onClick={() => setActiveTab('friends')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'friends'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Friends ({friends.length})
              </button>
              <button
                onClick={() => setActiveTab('requests')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'requests'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Requests ({receivedRequests.length + sentRequests.length})
              </button>
              <button
                onClick={() => setActiveTab('search')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'search'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Add Friends
              </button>
            </div>

            {/* Error Display */}
            {error && (
              <div className="mb-4 p-4 bg-red-500/20 border border-red-500/50 text-red-400 rounded-lg">
                {error}
              </div>
            )}

            {/* Friends Tab */}
            {activeTab === 'friends' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-white">Your Friends</h2>
                  <button
                    onClick={generateNewFriendCode}
                    disabled={loading}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 transition-colors"
                  >
                    {loading ? "Generating..." : "Generate New Code"}
                  </button>
                </div>
                
                {loading ? (
                  <div className="text-center py-8">
                    <div className="text-white">Loading friends...</div>
                  </div>
                ) : friends.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-gray-400">No friends yet. Start adding some!</div>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {friends.map((friendship) => (
                      <UserCard
                        key={friendship.friendship_id}
                        user={friendship.friend}
                        showActions={false}
                        isFriend={true}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Requests Tab */}
            {activeTab === 'requests' && (
              <div className="space-y-6">
                {/* Received Requests */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Received Requests</h3>
                  {receivedRequests.length === 0 ? (
                    <p className="text-gray-400">No pending friend requests</p>
                  ) : (
                    <div className="grid gap-4">
                      {receivedRequests.map((request) => (
                        <UserCard
                          key={request.id}
                          user={request.sender!}
                          onAcceptRequest={handleAcceptRequest}
                          onRejectRequest={handleRejectRequest}
                          requestId={request.id}
                          isPending={true}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Sent Requests */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Sent Requests</h3>
                  {sentRequests.length === 0 ? (
                    <p className="text-gray-400">No sent friend requests</p>
                  ) : (
                    <div className="grid gap-4">
                      {sentRequests.map((request) => (
                        <UserCard
                          key={request.id}
                          user={request.receiver!}
                          showActions={false}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Search Tab */}
            {activeTab === 'search' && (
              <div>
                <h2 className="text-xl font-semibold text-white mb-4">Add Friends</h2>
                
                {/* Search by Friend Code */}
                <div className="bg-[#1A1A1A] rounded-lg p-6 mb-6">
                  <h3 className="text-lg font-medium text-white mb-4">Search by Friend Code</h3>
                  <div className="flex space-x-3">
                    <input
                      type="text"
                      placeholder="Enter friend code (e.g., #1234)"
                      value={searchCode}
                      onChange={(e) => setSearchCode(e.target.value)}
                      className="flex-1 px-4 py-2 bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                    />
                    <button
                      onClick={handleSearch}
                      disabled={searchLoading || !searchCode.trim()}
                      className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors"
                    >
                      {searchLoading ? "Searching..." : "Search"}
                    </button>
                  </div>
                  
                  {/* Search Result */}
                  {searchResult && (
                    <div className="mt-4">
                      <UserCard
                        user={searchResult}
                        onSendRequest={handleSendRequest}
                        showActions={true}
                      />
                    </div>
                  )}
                </div>

                {/* Your Friend Code */}
                <div className="bg-[#1A1A1A] rounded-lg p-6">
                  <h3 className="text-lg font-medium text-white mb-4">Your Friend Code</h3>
                  <div className="flex items-center space-x-3">
                    <code className="px-4 py-2 bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg text-white font-mono text-lg">
                      {(session.user as ExtendedUser).friend_code || "Generating..."}
                    </code>
                    <button
                      onClick={generateNewFriendCode}
                      disabled={loading}
                      className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 transition-colors"
                    >
                      {loading ? "Generating..." : "Generate New"}
                    </button>
                  </div>
                  <p className="text-gray-400 text-sm mt-2">
                    Share this code with others so they can add you as a friend!
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
