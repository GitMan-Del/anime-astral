"use client";

import Image from "next/image";
import { useState } from "react";
import { Friend } from "../../lib/hooks/useFriends";

interface UserCardProps {
  user: Friend;
  onSendRequest?: (userId: string) => void;
  onAcceptRequest?: (requestId: string) => void;
  onRejectRequest?: (requestId: string) => void;
  requestId?: string;
  showActions?: boolean;
  isFriend?: boolean;
  isPending?: boolean;
}

export default function UserCard({
  user,
  onSendRequest,
  onAcceptRequest,
  onRejectRequest,
  requestId,
  showActions = true,
  isFriend = false,
  isPending = false,
}: UserCardProps) {
  const [loading, setLoading] = useState(false);

  const handleSendRequest = async () => {
    if (!onSendRequest) return;
    
    setLoading(true);
    try {
      await onSendRequest(user.id);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    if (!onAcceptRequest || !requestId) return;
    
    setLoading(true);
    try {
      await onAcceptRequest(requestId);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!onRejectRequest || !requestId) return;
    
    setLoading(true);
    try {
      await onRejectRequest(requestId);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#1A1A1A] rounded-lg p-4 border border-[#2A2A2A] hover:border-[#3A3A3A] transition-all duration-200">
      <div className="flex items-center space-x-4">
        {/* Avatar */}
        <div className="relative">
          <Image
            src={user.avatar_url || "/default-profile.png"}
            alt={user.display_name || user.username || "User"}
            width={60}
            height={60}
            className="rounded-full object-cover"
          />
          {isFriend && (
            <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1">
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          )}
        </div>

        {/* User Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <h3 className="text-white font-semibold truncate">
              {user.display_name || user.username || "Unknown User"}
            </h3>
            {user.friend_code && (
              <span className="text-gray-400 text-sm font-mono">
                {user.friend_code}
              </span>
            )}
          </div>
          <p className="text-gray-400 text-sm truncate">
            {user.username || "No username"}
          </p>
          {isFriend && (
            <p className="text-green-400 text-xs">
              Friends since {new Date(user.created_at).toLocaleDateString()}
            </p>
          )}
        </div>

        {/* Actions */}
        {showActions && (
          <div className="flex space-x-2">
            {isFriend ? (
              <span className="text-green-400 text-sm font-medium px-3 py-1 bg-green-500/10 rounded-full">
                Friends
              </span>
            ) : isPending ? (
              <div className="flex space-x-2">
                <button
                  onClick={handleAccept}
                  disabled={loading}
                  className="px-3 py-1 bg-green-500 text-white text-sm rounded-full hover:bg-green-600 disabled:opacity-50 transition-colors"
                >
                  {loading ? "..." : "Accept"}
                </button>
                <button
                  onClick={handleReject}
                  disabled={loading}
                  className="px-3 py-1 bg-red-500 text-white text-sm rounded-full hover:bg-red-600 disabled:opacity-50 transition-colors"
                >
                  {loading ? "..." : "Reject"}
                </button>
              </div>
            ) : (
              <button
                onClick={handleSendRequest}
                disabled={loading}
                className="px-3 py-1 bg-blue-500 text-white text-sm rounded-full hover:bg-blue-600 disabled:opacity-50 transition-colors"
              >
                {loading ? "..." : "Add Friend"}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
