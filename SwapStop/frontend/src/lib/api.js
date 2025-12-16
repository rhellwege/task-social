const API_BASE = import.meta.env.VITE_API_BASE ?? "" + "/api"; 


async function request(path, options = {}) {
  const res = await fetch(API_BASE + path, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    let body;
    try { body = await res.json(); } catch { body = await res.text(); }
    throw new Error(`[${res.status}] ${typeof body === "string" ? body : JSON.stringify(body)}`);
  }
  // return JSON if possible, else raw text
  const ct = res.headers.get("content-type") || "";
  return ct.includes("application/json") ? res.json() : res.text();
}

// Users
export const listUsers = (skip = 0, limit = 10) => request(`/users/?skip=${skip}&limit=${limit}`);
export const createUser = (payload) =>
  request(`/users/`, { method: "POST", body: JSON.stringify(payload) });
export const deleteUser = (userId) =>
  request(`/users/${userId}`, { method: "DELETE" });

// Items
export const listItems = (skip = 0, limit = 100) => request(`/items/?skip=${skip}&limit=${limit}`);
export const listUserItems = (userId) => request(`/users/${userId}/items/`);
export const createItemForUser = (userId, payload) =>
  request(`/users/${userId}/items/`, { method: "POST", body: JSON.stringify(payload) });
export const deleteItem = (itemId) =>
  request(`/items/${itemId}`, { method: "DELETE" });
