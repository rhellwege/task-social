import { useEffect, useMemo, useState } from "react";
import Chat from "./components/Chat";

/**
 * SwapStop — React Skeleton (simple, single-file UI)
 * - Matches doc aesthetic (green/black/white, rounded, grid)
 * - Uses only your existing endpoints:
 *   POST /users/
 *   GET  /users/?skip=&limit=
 *   DELETE /users/{id}
 *   POST /users/{user_id}/items/
 *   GET  /users/{user_id}/items/
 *   GET  /items/?skip=&limit=
 *   DELETE /items/{item_id}
 *
 * Set API_BASE = "" to use same origin (recommended if served by FastAPI).
 * Otherwise set to "http://127.0.0.1:8000" and enable CORS in FastAPI.
 */

const API_BASE = ""; // "" = same-origin; or "http://127.0.0.1:8000"

async function api(path, opts = {}) {
  const res = await fetch(API_BASE + path, {
    headers: { "Content-Type": "application/json" },
    ...opts,
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

function Section({ title, children }) {
  return (
    <section className="card">
      {title ? <h2>{title}</h2> : null}
      {children}
    </section>
  );
}

function Input({ label, ...props }) {
  return (
    <div>
      {label ? <label className="lbl">{label}</label> : null}
      <input className="input" {...props} />
    </div>
  );
}

function Textarea({ label, ...props }) {
  return (
    <div>
      {label ? <label className="lbl">{label}</label> : null}
      <textarea className="input" {...props} />
    </div>
  );
}

function Select({ label, children, ...props }) {
  return (
    <div>
      {label ? <label className="lbl">{label}</label> : null}
      <select className="input" {...props}>
        {children}
      </select>
    </div>
  );
}

function TabButton({ active, onClick, children }) {
  return (
    <button className={active ? "tab active" : "tab"} onClick={onClick}>
      {children}
    </button>
  );
}

function HomeSkeleton() {
  // Pure placeholders for now—this mirrors the visual style in the doc.
  const cards = useMemo(() => Array.from({ length: 6 }), []);
  return (
    <>
      <Section>
        <h2>Home Feed</h2>
        <p className="muted">
          Newest listings & recommendations (placeholder cards to match the
          mockup; wire up later if you add a home endpoint).
        </p>
      </Section>
      <div className="grid">
        {cards.map((_, i) => (
          <div className="card" key={i}>
            <div className="thumb" />
            <div className="title">Sample Item {i + 1}</div>
            <div className="rowline">
              <span>${(99 + i).toFixed(2)}</span>
              <span className="badge">cash</span>
            </div>
            <p className="muted">Short description...</p>
            <div className="actions">
              <button className="btn">View</button>
              <button className="btn outline">Save</button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function Users() {
  const [users, setUsers] = useState([]);
  const [skip, setSkip] = useState(0);
  const [limit, setLimit] = useState(10);
  const [uUsername, setUUsername] = useState("");
  const [uEmail, setUEmail] = useState("");
  const [uPassword, setUPassword] = useState("");
  const [selUser, setSelUser] = useState("");
  const [selUserItems, setSelUserItems] = useState("");
  const [itemName, setItemName] = useState("");
  const [itemDesc, setItemDesc] = useState("");
  const [itemPrice, setItemPrice] = useState("");
  const [userItems, setUserItems] = useState([]);
  const [status, setStatus] = useState("");

  async function loadUsers() {
    const data = await api(`/users/?skip=${Number(skip)}&limit=${Number(limit)}`);
    setUsers(data);
    // keep dropdowns in sync
    if (data.length && !selUser) setSelUser(String(data[0].id));
    if (data.length && !selUserItems) setSelUserItems(String(data[0].id));
  }

  async function createUser() {
    if (!uUsername || !uEmail || !uPassword) {
      setStatus("All user fields are required.");
      return;
    }
    try {
      await api("/users/", {
        method: "POST",
        body: JSON.stringify({
          username: uUsername,
          email: uEmail,
          password: uPassword,
        }),
      });
      setStatus("User created.");
      setUUsername("");
      setUEmail("");
      setUPassword("");
      await loadUsers();
    } catch (e) {
      setStatus(e.message);
    }
  }

  async function deleteUser(id) {
    if (!confirm(`Delete user #${id}? This also deletes their items.`)) return;
    try {
      await api(`/users/${id}`, { method: "DELETE" });
      setStatus(`Deleted user ${id}`);
      await loadUsers();
      setUserItems([]); // clear table
    } catch (e) {
      setStatus(e.message);
    }
  }

  async function createItem() {
    if (!selUser) return setStatus("Pick a user first.");
    if (!itemName.trim()) return setStatus("Item name is required.");
    try {
      await api(`/users/${selUser}/items/`, {
        method: "POST",
        body: JSON.stringify({
          name: itemName.trim(),
          description: itemDesc.trim() || null,
          price_estimate: itemPrice ? Number(itemPrice) : null,
        }),
      });
      setStatus("Item created.");
      setItemName("");
      setItemDesc("");
      setItemPrice("");
      await loadUserItems();
    } catch (e) {
      setStatus(e.message);
    }
  }

  async function loadUserItems() {
    if (!selUserItems) return setStatus("Pick a user to load items.");
    const data = await api(`/users/${selUserItems}/items/`);
    setUserItems(data);
  }

  useEffect(() => {
    loadUsers().catch((e) => setStatus(e.message));
  }, []);

  return (
    <>
      <Section title="Users">
        <div className="row2">
          <Input label="Username" value={uUsername} onChange={(e) => setUUsername(e.target.value)} />
          <Input label="Email" value={uEmail} onChange={(e) => setUEmail(e.target.value)} />
        </div>
        <Input
          label="Password"
          type="password"
          value={uPassword}
          onChange={(e) => setUPassword(e.target.value)}
        />
        <div className="actions">
          <button className="btn" onClick={createUser}>Create User</button>
          <span className="muted">{status}</span>
        </div>
      </Section>

      <Section>
        <div className="row2">
          <Input label="Skip" type="number" value={skip} onChange={(e) => setSkip(e.target.value)} />
          <Input label="Limit" type="number" value={limit} onChange={(e) => setLimit(e.target.value)} />
        </div>
        <div className="actions">
          <button className="btn outline" onClick={loadUsers}>Load Users</button>
        </div>
        <table className="table">
          <thead>
            <tr><th>ID</th><th>Username</th><th>Email</th><th></th></tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td>{u.username}</td>
                <td>{u.email}</td>
                <td>
                  <button className="btn outline" onClick={() => deleteUser(u.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {!users.length && (
              <tr><td colSpan={4} className="muted">No users yet.</td></tr>
            )}
          </tbody>
        </table>
      </Section>

      <Section title="Create Item for Selected User">
        <Select label="User" value={selUser} onChange={(e) => setSelUser(e.target.value)}>
          <option value="">— pick user —</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>{u.username} (#{u.id})</option>
          ))}
        </Select>
        <Input label="Name" value={itemName} onChange={(e) => setItemName(e.target.value)} />
        <Textarea label="Description" value={itemDesc} onChange={(e) => setItemDesc(e.target.value)} />
        <Input
          label="Price Estimate (optional)"
          type="number"
          step="0.01"
          value={itemPrice}
          onChange={(e) => setItemPrice(e.target.value)}
        />
        <div className="actions">
          <button className="btn" onClick={createItem}>Add Item</button>
        </div>
      </Section>

      <Section title="User’s Items">
        <Select
          label="User"
          value={selUserItems}
          onChange={(e) => setSelUserItems(e.target.value)}
        >
          <option value="">— pick user —</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>{u.username} (#{u.id})</option>
          ))}
        </Select>
        <div className="actions">
          <button className="btn outline" onClick={loadUserItems}>Load Items</button>
        </div>
        <table className="table">
          <thead>
            <tr><th>ID</th><th>Name</th><th>Price</th></tr>
          </thead>
          <tbody>
            {userItems.map((it) => (
              <tr key={it.id}>
                <td>{it.id}</td>
                <td>{it.name}</td>
                <td>{it.price_estimate ?? ""}</td>
              </tr>
            ))}
            {!userItems.length && (
              <tr><td colSpan={3} className="muted">No items yet.</td></tr>
            )}
          </tbody>
        </table>
      </Section>
    </>
  );
}

function Items() {
  const [items, setItems] = useState([]);
  const [skip, setSkip] = useState(0);
  const [limit, setLimit] = useState(100);
  const [status, setStatus] = useState("");

  async function loadItems() {
    const data = await api(`/items/?skip=${Number(skip)}&limit=${Number(limit)}`);
    setItems(data);
  }

  async function deleteItem(id) {
    if (!confirm(`Delete item #${id}?`)) return;
    try {
      await api(`/items/${id}`, { method: "DELETE" });
      setStatus(`Deleted item ${id}`);
      await loadItems();
    } catch (e) {
      setStatus(e.message);
    }
  }

  useEffect(() => {
    loadItems().catch((e) => setStatus(e.message));
  }, []);

  return (
    <>
      <Section title="All Items">
        <div className="row2">
          <Input label="Skip" type="number" value={skip} onChange={(e) => setSkip(e.target.value)} />
          <Input label="Limit" type="number" value={limit} onChange={(e) => setLimit(e.target.value)} />
        </div>
        <div className="actions">
          <button className="btn outline" onClick={loadItems}>Load</button>
          <span className="muted">{status}</span>
        </div>
      </Section>

      <div className="grid">
        {items.map((it) => (
          <div className="card" key={it.id}>
            <div className="thumb" />
            <div className="title">{it.name}</div>
            <div className="rowline">
              <span>${(it.price_estimate ?? 0).toFixed(2)}</span>
              <span className="badge">owner #{it.owner_id}</span>
            </div>
            <div className="actions">
              <button className="btn outline" onClick={() => deleteItem(it.id)}>Delete</button>
            </div>
          </div>
        ))}
        {!items.length && <div className="muted">No items found.</div>}
      </div>
    </>
  );
}

export default function App() {
  const [tab, setTab] = useState("home");
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    // default to home
  }, []);

  return (
    <div>
      <header className="header">
        <nav className="nav">
          <div className="brand">SwapStop</div>
          <div className="spacer" />
          <TabButton active={tab === "home"} onClick={() => setTab("home")}>Home</TabButton>
          <TabButton active={tab === "users"} onClick={() => setTab("users")}>Users</TabButton>
          <TabButton active={tab === "items"} onClick={() => setTab("items")}>Items</TabButton>
      {/* Floating Chat Button */}
      <button
        className="btn"
        style={{
          position: "fixed",
          bottom: 32,
          right: 32,
          zIndex: 1100,
          borderRadius: "50%",
          width: 56,
          height: 56,
          boxShadow: "0 4px 16px rgba(0,0,0,0.25)",
          fontSize: 22,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 0,
        }}
        onClick={() => setShowChat(true)}
        aria-label="Open chat"
      >
        Chat
      </button>
        </nav>
      </header>

      <main className="wrap">
        {tab === "home" && <HomeSkeleton />}
        {tab === "users" && <Users />}
        {tab === "items" && <Items />}

        {showChat && (
          <div
            style={{
              position: "fixed",
              bottom: 100,
              right: 32,
              zIndex: 1101,
              background: "rgba(15,23,42,0.98)",
              borderRadius: 16,
              boxShadow: "0 8px 32px rgba(0,0,0,0.35)",
              padding: 0,
              minWidth: 340,
              maxWidth: 420,
            }}
            onClick={e => e.stopPropagation()}
          >
            <button
              className="btn outline"
              style={{ position: "absolute", top: 8, right: 8, zIndex: 1002 }}
              onClick={() => setShowChat(false)}
            >
              ×
            </button>
            <Chat />
          </div>
        )}

        <section className="card">
          <pre className="muted" style={{ whiteSpace: "pre-wrap" }}>
            {/* Status/debug area (optional). */} 
          </pre>
        </section>

        <footer className="footer">© 2025 SwapStop — React Skeleton</footer>
      </main>
    </div>
  );
}
