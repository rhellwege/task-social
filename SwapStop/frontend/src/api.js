const API_BASE =
  (import.meta.env.VITE_API_BASE && import.meta.env.VITE_API_BASE.trim()) || "";

async function request(path, options = {}) {
  const res = await fetch(API_BASE + path, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    let body = "";
    try {
      body = await res.json();
    } catch {
      body = await res.text();
    }
    throw new Error(
      `[${res.status}] ${typeof body === "string" ? body : JSON.stringify(body)}`
    );
  }
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return text;
  }
}

export const api = {
  // USERS
  listUsers: (skip = 0, limit = 10) =>
    request(`/users/?skip=${Number(skip)}&limit=${Number(limit)}`),
  createUser: (payload) =>
    request("/users/", { method: "POST", body: JSON.stringify(payload) }),
  deleteUser: (id) => request(`/users/${id}`, { method: "DELETE" }),

  // ITEMS
  listItems: (skip = 0, limit = 100) =>
    request(`/items/?skip=${Number(skip)}&limit=${Number(limit)}`),
  createItemForUser: (userId, payload) =>
    request(`/users/${userId}/items/`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  listItemsForUser: (userId) => request(`/users/${userId}/items/`),
  deleteItem: (id) => request(`/items/${id}`, { method: "DELETE" }),
};
