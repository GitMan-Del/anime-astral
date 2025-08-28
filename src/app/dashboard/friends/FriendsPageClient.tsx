// app/friends/FriendsPageClient.tsx
"use client";

import { useEffect, useState } from "react";
import FriendCard from "@/app/components/FriendCard";
import {
  searchByCode,
  sendRequest,
  getFriends,
  getRequests,
  respondRequest,
  cancelRequest,
} from "@/lib/friendsClient";

type FriendUser = {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  friend_code: string | null;
  isVerified?: boolean;
};

type FriendRequest = {
  id: string;
  sender_id: string;
  receiver_id: string;
  status: "pending" | "accepted" | "rejected";
  created_at: string;
};

function RequestsPanel({
  title,
  open,
  onClose,
  items,
  type,
  onAccept,
  onReject,
  onCancel,
}: {
  title: string;
  open: boolean;
  onClose: () => void;
  items: FriendRequest[];
  type: "incoming" | "sent";
  onAccept?: (id: string) => Promise<void>;
  onReject?: (id: string) => Promise<void>;
  onCancel?: (id: string) => Promise<void>;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
      <div className="w-full max-w-lg rounded-xl border border-[#595959]/30 bg-[#161616] p-4 text-white shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button className="text-white/60 hover:text-white" onClick={onClose}>
            Close
          </button>
        </div>

        <div className="flex flex-col gap-2 max-h-[60vh] overflow-y-auto">
          {items.length === 0 && (
            <div className="text-sm text-white/60">Nicio cerere</div>
          )}

          {items.map((r) => (
            <div
              key={r.id}
              className="flex items-center justify-between rounded-lg bg-[#101010] p-3"
            >
              <div className="text-sm text-white/80">ID: {r.id}</div>

              {type === "incoming" ? (
                <div className="flex gap-2">
                  <button
                    className="px-3 py-1.5 rounded bg-white/10 hover:bg-white/20"
                    onClick={() => onReject && onReject(r.id)}
                  >
                    Respinge
                  </button>
                  <button
                    className="px-3 py-1.5 rounded bg-[#2a7] hover:bg-[#2a7]/80"
                    onClick={() => onAccept && onAccept(r.id)}
                  >
                    Acceptă
                  </button>
                </div>
              ) : (
                <button
                  className="px-3 py-1.5 rounded bg-red-600/80 hover:bg-red-600"
                  onClick={() => onCancel && onCancel(r.id)}
                >
                  Anulează
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function FriendsPageClient() {
  const [code, setCode] = useState("");
  const [searchResult, setSearchResult] = useState<FriendUser | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [friends, setFriends] = useState<FriendUser[]>([]);
  const [showIncoming, setShowIncoming] = useState(false);
  const [showSent, setShowSent] = useState(false);
  const [incoming, setIncoming] = useState<FriendRequest[]>([]);
  const [outgoing, setOutgoing] = useState<FriendRequest[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const { friends } = await getFriends();
        setFriends(friends);
      } catch {
        setFriends([]);
      }
    })();
  }, []);

  async function refreshRequests() {
    try {
      const { incoming, outgoing } = await getRequests();
      setIncoming(incoming);
      setOutgoing(outgoing);
    } catch {
      setIncoming([]);
      setOutgoing([]);
    }
  }

  async function onSearch() {
    setSearchError(null);
    setSearchResult(null);
    if (!code.trim()) return;
    try {
      const res = await searchByCode(code.trim());
      setSearchResult(res.user);
    } catch {
      setSearchError("Nu am găsit utilizatorul");
    }
  }

  async function onSendRequest() {
    if (!searchResult) return;
    await sendRequest(searchResult.id);
    setSearchResult(null);
    setCode("");
  }

  const mockFriends: FriendUser[] = [];

  return (
    <div className="flex flex-col">
      <section className="rounded-xl p-4">
        <div className="flex items-center gap-3">
          <div className="relative w-full max-w-[500px]">
            <input
              className="w-full bg-[#0E0E0E] border border-[#2A2A2A] rounded-3xl pl-5 pr-28 py-3 text-white placeholder:text-white/30 outline-none focus:border-[#3A3A3A] transition-colors"
              placeholder="Search a friend"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              maxLength={8}
            />
            <button
              className="absolute top-1/2 -translate-y-1/2 right-2 px-5 py-2 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-base"
              onClick={onSearch}
            >
              Search
            </button>
          </div>

          <button
            className="px-4 py-2 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-sm whitespace-nowrap"
            onClick={async () => {
              await refreshRequests();
              setShowIncoming(true);
            }}
          >
            Incoming
          </button>

          <button
            className="px-4 py-2 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-sm whitespace-nowrap"
            onClick={async () => {
              await refreshRequests();
              setShowSent(true);
            }}
          >
            Sent
          </button>
        </div>

        {searchError && (
          <p className="text-red-400 mt-2 text-sm">{searchError}</p>
        )}

        {searchResult && (
          <div className="mt-4">
            <FriendCard
              user={searchResult}
              primaryActionLabel="Trimite cerere"
              onPrimaryAction={async () => onSendRequest()}
            />
          </div>
        )}
      </section>

      {!searchResult && (
        <section className="mt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-8 xl:gap-10">
            {(friends.length ? friends : mockFriends).map((u) => (
              <FriendCard key={u.id} user={u} />
            ))}
          </div>
        </section>
      )}

      <RequestsPanel
        title="Cereri primite"
        open={showIncoming}
        onClose={() => setShowIncoming(false)}
        items={incoming}
        type="incoming"
        onAccept={async (id) => {
          await respondRequest(id, "accept");
          await refreshRequests();
        }}
        onReject={async (id) => {
          await respondRequest(id, "reject");
          await refreshRequests();
        }}
      />

      <RequestsPanel
        title="Cereri trimise"
        open={showSent}
        onClose={() => setShowSent(false)}
        items={outgoing}
        type="sent"
        onCancel={async (id) => {
          await cancelRequest(id);
          await refreshRequests();
        }}
      />
    </div>
  );
}
