export async function searchByCode(code: string) {
  const res = await fetch(`/api/friends/search?code=${encodeURIComponent(code)}`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function sendRequest(receiverId: string) {
  const res = await fetch(`/api/friends/requests`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ receiverId }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getRequests() {
  const res = await fetch(`/api/friends/requests`, { cache: "no-store" });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function respondRequest(id: string, action: "accept" | "reject") {
  const res = await fetch(`/api/friends/requests/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function cancelRequest(id: string) {
  const res = await fetch(`/api/friends/requests/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getFriends() {
  const res = await fetch(`/api/friends/list`, { cache: "no-store" });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function unfriend(userId: string) {
  const res = await fetch(`/api/friends/unfriend/${userId}`, { method: "DELETE" });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}


