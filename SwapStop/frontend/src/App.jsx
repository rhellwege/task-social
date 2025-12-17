import { useEffect, useState } from "react";
import "./App.css";

// static demo items for Home page
const sampleItems = [
  { id: 1, title: "Red Chair", price: 99.99, image: "/images/item1.jpg", description: "Comfortable red chair." },
  { id: 2, title: "Blue Lamp", price: 49.99, image: "/images/item2.jpg", description: "Outdoor lamp." },
  { id: 3, title: "Green Plant", price: 29.99, image: "/images/item3.jpg", description: "Lush indoor plant." },
  { id: 4, title: "Wooden Table", price: 199.99, image: "/images/item4.jpg", description: "Solid oak table." },
  { id: 5, title: "Notebook", price: 9.99, image: "/images/item5.jpg", description: "Lined notebook for notes." },
  { id: 6, title: "Coffee Mug", price: 14.99, image: "/images/item6.jpg", description: "Ceramic coffee mug." },
];



const RAW_BASE = import.meta.env.VITE_API_BASE ?? "";
const USING_PROXY = RAW_BASE === "";

// If using proxy, keep same-origin and add '/api'. If using explicit base, DO NOT add '/api'.
const API_BASE = USING_PROXY ? "" : RAW_BASE.replace(/\/+$/, "");
const API_PREFIX = USING_PROXY ? "/api" : ""; // proxy only triggers on /api

async function api(path, options = {}) {
  const normalized = (path.startsWith("/") ? path : `/${path}`);
  const url = `${API_BASE}${API_PREFIX}${normalized}`;

  const token = window.localStorage.getItem("access_token") || null;

  const mergedHeaders = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(options.headers || {}),
  };
  if (token) {
    mergedHeaders.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    ...options,
    headers: mergedHeaders,
  });

  const raw = await res.text();
  let data = null;
  try { data = raw ? JSON.parse(raw) : null; 

  } catch { data = raw || null; }

  if (!res.ok) {
    const detail = typeof data === "string" ? data : JSON.stringify(data);
    throw new Error(`[${res.status} ${res.statusText}] ${detail} @ ${url}`);
  }

  return data;
}

function getArray(payload, key){
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.[key])) return payload[key];
  return[];
}

function fmtMoney(n) {
  return typeof n === "number" ? n.toFixed(2) : "-";
}

export default function App() {
  const [activeTab, setActiveTab] = useState("home");
  const [user, setUser] = useState(null); // lifted auth state

  return (
    <div className="page">
      <header className="header">
        <div className="brand">SwapStop</div>
        <nav className="nav">
          <button className={activeTab === "home" ? "tab active" : "tab"} onClick={() => setActiveTab("home")}>
            Home
          </button>
          <button className={activeTab === "account" ? "tab active" : "tab"} onClick={() => setActiveTab("account")}>
            Account
          </button>
          <button className={activeTab === "items" ? "tab active" : "tab"} onClick={() => setActiveTab("items")}>
            Items
          </button>
        </nav>
      </header>

      <main className="wrap">
        {activeTab === "home" && <Home user={user} />}
        {activeTab === "account" && (
          <Account
            user={user}
            onLogin={(u) => { setUser(u); setActiveTab("home"); }}    // go Home after login
            onLogout={() => { setUser(null); setActiveTab("home"); }} // go Home after logout/delete
          />
        )}
        {activeTab === "items" && <Items user={user} />}
      </main>
    </div>
  );
}

function Home({ user }) {
  return (
    <>
      <section className="card">
        <h2>Home</h2>
        {!user ? (
          <p className="muted">Welcome! Browse featured listings below. Log in or register in the Account tab.</p>
        ) : (
          <p className="muted">Welcome back, <strong>{user.username}</strong>. Here are some featured listings.</p>
        )}
      </section>

      <div className="grid">
        {sampleItems.map((item) => (
          <div className="card" key={item.id}>
            <img
              src={item.image}
              alt={item.title}
              className="thumb"
              style={{ width: "100%", height: 150, objectFit: "cover", borderRadius: 10 }}
            />
            <div className="title">{item.title}</div>
            <div className="rowline">
              <span>${item.price.toFixed(2)}</span>
              <span className="badge">cash</span>
            </div>
            <p className="muted">{item.description}</p>
          </div>
        ))}
      </div>
    </>
  );
}


function Account({ user, onLogin, onLogout }) {
  const [mode, setMode] = useState(user ? "profile" : "login");

  // login
  const [loginIdentifier, setLoginIdentifier] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // register
  const [regUsername, setRegUsername] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regFullName, setRegFullName] = useState("");

  // 2FA UI
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [twoFactorMethod, setTwoFactorMethod] = useState("sms");
  const [twoFactorSetupVisible, setTwoFactorSetupVisible] = useState(false);

  const [accountStatus, setAccountStatus] = useState("active");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    setMode(user ? "profile" : "login");
  }, [user]);

  async function handleRegister(e) {
    e.preventDefault();
    setMessage("");
    if (!regUsername || !regEmail || !regPassword || !regFullName) {
      setMessage("All fields are required."); return;
    }
    if (!isStrongPassword(regPassword)) {
      setMessage("Password must be at least 8 chars with uppercase, number, symbol."); return;
    }
    setBusy(true);
    try {
      const created = await api("/users/", {
        method: "POST",
        body: JSON.stringify({
          username: regUsername,
          email: regEmail,
          password: regPassword,
          full_name: regFullName,
        }),
      });
      onLogin(created);
      setMessage("Account created and logged in.");
      setRegUsername(""); setRegEmail(""); setRegPassword(""); setRegFullName("");
    } catch (err) {
      setMessage(String(err.message || err));
    } finally {
      setBusy(false);
    }
  }

 async function handleLogin(e) {
  e.preventDefault();
  setMessage("");

  if (!loginIdentifier || !loginPassword) {
    setMessage("Email/username and password are required.");
    return;
  }

  setBusy(true);
  try {
    // request token using form-encoded body
    const form = new URLSearchParams();
    form.append("username", loginIdentifier);
    form.append("password", loginPassword);
    form.append("grant_type", "password");

    const tokenRes = await fetch(`${API_BASE}${API_PREFIX}/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: form.toString(),
    });

    if (!tokenRes.ok) {
      const errText = await tokenRes.text();
      throw new Error(`[${tokenRes.status}] ${errText}`);
    }

    const tokenPayload = await tokenRes.json();
    if (!tokenPayload.access_token) {
      throw new Error("No access_token in /token response.");
    }

    window.localStorage.setItem("access_token", tokenPayload.access_token);

    const me = await api("/users/me");
    onLogin(me);
    setAccountStatus("active");
    setMessage("Logged in.");
  } catch (err) {
    setMessage(String(err.message || err));
  } finally {
    setBusy(false);
  }
}


  async function deleteAccount() {
    if (!user?.id) { setMessage("No user id to delete."); return; }
    if (!confirm("Delete your account permanently?")) return;
    setBusy(true);
    try {
      await api(`/users/${user.id}`, { method: "DELETE" });
      window.localStorage.removeItem("access_token");
      onLogout();
      setMessage("Account deleted.");
    } catch (err) {
      setMessage(String(err.message || err));
    } finally {
      setBusy(false);
    }
  }

  function fullLogout() {
    window.localStorage.removeItem("access_token");
    onLogout();
  }


  function deactivateAccount() {
    setAccountStatus("deactivated");
    setMessage("Account marked deactivated (UI only).");
  }
  function openTwoFactorSetup() { setTwoFactorSetupVisible(true); }
  function completeTwoFactorSetup() { setTwoFactorEnabled(true); setTwoFactorSetupVisible(false); setMessage("2FA enabled."); }
  function disableTwoFactor() { setTwoFactorEnabled(false); setMessage("2FA disabled."); }

  if (user && mode === "profile") {
    return (
      <section className="card">
        <h2>Account</h2>
        <p>Logged in as <strong>{user.username}</strong> <span className="muted">({user.email})</span></p>
        <p className="muted">Status: {accountStatus}</p>

        <div className="section-block">
          <h3>Two-Factor Authentication</h3>
          {!twoFactorEnabled && !twoFactorSetupVisible && (
            <button className="btn" onClick={openTwoFactorSetup}>Enable 2FA</button>
          )}
          {twoFactorSetupVisible && (
            <div className="panel">
              <p>Select a method:</p>
              <div className="row">
                <label><input type="radio" name="method" value="sms" checked={twoFactorMethod==="sms"} onChange={(e)=>setTwoFactorMethod(e.target.value)}/> SMS</label>
                <label><input type="radio" name="method" value="app" checked={twoFactorMethod==="app"} onChange={(e)=>setTwoFactorMethod(e.target.value)}/> Authenticator app</label>
              </div>
              <div className="row">
                <button className="btn" onClick={completeTwoFactorSetup}>Confirm setup</button>
                <button className="btn outline" onClick={()=>setTwoFactorSetupVisible(false)}>Cancel</button>
              </div>
            </div>
          )}
          {twoFactorEnabled && !twoFactorSetupVisible && (
            <div className="row">
              <span className="badge">2FA enabled</span>
              <button className="btn outline" onClick={disableTwoFactor}>Disable 2FA</button>
            </div>
          )}
        </div>

        <div className="section-block">
          <h3>Account Actions</h3>
          <div className="row">
            <button className="btn outline" onClick={deactivateAccount}>Deactivate Account</button>
            <button className="btn danger" onClick={deleteAccount}>Delete Account</button>
            <button
              className="btn"
              onClick={() => {
                window.localStorage.removeItem("access_token");
                fullLogout();
              }}
            >
              Log Out
            </button>

          </div>
        </div>

        {message && <p className="muted">{message}</p>}
        {busy && <p className="muted">Working...</p>}
      </section>
    );
  }

  return (
    <section className="card">
      <h2>Account</h2>
      <div className="tabs-secondary">
        <button className={(!user && mode==="login") ? "tab secondary active" : "tab secondary"} onClick={()=>{setMode("login"); setMessage("");}}>
          Log In
        </button>
        <button className={(!user && mode==="register") ? "tab secondary active" : "tab secondary"} onClick={()=>{setMode("register"); setMessage("");}}>
          Register
        </button>
      </div>

      {mode === "login" && (
        <form className="form" onSubmit={handleLogin}>
          <label className="lbl">Username or Email
            <input className="input" value={loginIdentifier} onChange={(e)=>setLoginIdentifier(e.target.value)} />
          </label>
          <label className="lbl">Password
            <input type="password" className="input" value={loginPassword} onChange={(e)=>setLoginPassword(e.target.value)} />
          </label>
          <button className="btn" type="submit" disabled={busy}>{busy ? "Logging in..." : "Log In"}</button>
          {message && <p className="muted">{message}</p>}
        </form>
      )}

      {mode === "register" && (
        <form className="form" onSubmit={handleRegister}>
          <label className="lbl">Full Name
            <input className="input" value={regFullName} onChange={(e)=>setRegFullName(e.target.value)} />
          </label>
          <label className="lbl">Username
            <input className="input" value={regUsername} onChange={(e)=>setRegUsername(e.target.value)} />
          </label>
          <label className="lbl">Email
            <input className="input" type="email" value={regEmail} onChange={(e)=>setRegEmail(e.target.value)} />
          </label>
          <label className="lbl">Password
            <input className="input" type="password" value={regPassword} onChange={(e)=>setRegPassword(e.target.value)} />
          </label>
          <button className="btn" type="submit" disabled={busy}>{busy ? "Creating..." : "Create Account"}</button>
          {message && <p className="muted">{message}</p>}
        </form>
      )}
    </section>
  );
}

function Items({ user }) {
  const [mode, setMode] = useState("browse"); // 'browse' | 'create' | 'user'
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  // browse
  const [items, setItems] = useState([]);
  const [skip, setSkip] = useState(0);
  const [limit, setLimit] = useState(20);

  // create
  const [ownerId, setOwnerId] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");

  // user items
  const [users, setUsers] = useState([]);
  const [userFilterId, setUserFilterId] = useState("");
  const [userItems, setUserItems] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  async function loadAllItems() {
    setLoading(true);
    setStatus("");
    try {
      const payload = await api(`/items/?skip=${Number(skip)}&limit=${Number(limit)}`);
      setItems(getArray(payload, "items"));
    } catch (e) {
      setStatus(String(e.message || e));
    } finally {
      setLoading(false);
    }
  }

  async function loadUsers() {
    setLoadingUsers(true);
    try {
      const payload = await api(`/users/?skip=0&limit=100`);
      setUsers(getArray(payload, "users"));
    } catch {
      setUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  }

  async function loadItemsForUser(uid) {
    if (!uid) return;
    setLoading(true);
    setStatus("");
    try {
      const payload = await api(`/users/${uid}/items/`);
      setUserItems(getArray(payload, "items"));
    } catch (e) {
      setStatus(String(e.message || e));
      setUserItems([]);
    } finally {
      setLoading(false);
    }
  }

  // auto-fill ownerId when logged-in user is present and Create tab is active
  useEffect(() => {
    if (mode === "create" && user?.id) {
      setOwnerId(String(user.id));
    }
    if (mode === "create" && !user?.id) {
      setOwnerId("");
    }
  }, [mode, user]);

  async function handleCreate(e) {
    e.preventDefault();
    setStatus("");

    const ownerNumeric = Number(ownerId);

    if (!ownerId || !Number.isFinite(ownerNumeric)) {
      setStatus("Owner ID must be a valid number (e.g., 1).");
      return;
    }
    if (!name) {
      setStatus("Name is required.");
      return;
    }

    setLoading(true);
    try {
      const body = {
        name,
        description: description || undefined,
        price_estimate: price ? Number(price) : undefined,
      };

      await api(`/users/${ownerNumeric}/items/`, {
        method: "POST",
        body: JSON.stringify(body),
      });

      setName("");
      setDescription("");
      setPrice("");
      setStatus("Item created.");

      if (mode === "browse") await loadAllItems();
      if (mode === "user" && userFilterId) await loadItemsForUser(userFilterId);
    } catch (e) {
      setStatus(String(e.message || e));
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(itemId) {
    if (!confirm(`Delete item #${itemId}?`)) return;
    setLoading(true);
    setStatus("");
    try {
      await api(`/items/${itemId}`, { method: "DELETE" });
      setStatus(`Deleted item ${itemId}.`);
      if (mode === "browse") await loadAllItems();
      if (mode === "user" && userFilterId) await loadItemsForUser(userFilterId);
    } catch (e) {
      setStatus(String(e.message || e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAllItems();
  }, []);

  useEffect(() => {
    if (mode === "user" && users.length === 0) loadUsers();
  }, [mode]);

  return (
    <section className="card">
      <h2>Items</h2>

      <div className="tabs-secondary" style={{ marginBottom: 12 }}>
        <button
          className={mode === "browse" ? "tab secondary active" : "tab secondary"}
          onClick={() => setMode("browse")}
        >
          Browse
        </button>
        <button
          className={mode === "create" ? "tab secondary active" : "tab secondary"}
          onClick={() => setMode("create")}
        >
          Create
        </button>
        <button
          className={mode === "user" ? "tab secondary active" : "tab secondary"}
          onClick={() => setMode("user")}
        >
          By User
        </button>
      </div>

      {status && <p className="muted">{status}</p>}

      {mode === "browse" && (
        <>
          <div className="row">
            <label className="lbl-inline">
              Skip
              <input
                className="input small"
                type="number"
                value={skip}
                onChange={(e) => setSkip(e.target.value)}
              />
            </label>
            <label className="lbl-inline">
              Limit
              <input
                className="input small"
                type="number"
                value={limit}
                onChange={(e) => setLimit(e.target.value)}
              />
            </label>
            <button className="btn" onClick={loadAllItems} disabled={loading}>
              {loading ? "Loading..." : "Reload"}
            </button>
          </div>

          <div className="grid">
            {items.map((it) => (
              <div key={it.id} className="card inner">
                <div className="title">
                  {it.name} <span className="muted">#{it.id}</span>
                </div>
                <p className="muted">{it.description || "No description."}</p>
                <div className="row">
                  <span className="badge">${fmtMoney(it.price_estimate)}</span>
                  <span className="muted">owner #{it.owner_id}</span>
                </div>
                <div className="row" style={{ justifyContent: "flex-end" }}>
                  <button className="btn outline" onClick={() => handleDelete(it.id)}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
            {!items.length && !loading && <p className="muted">No items found.</p>}
          </div>
        </>
      )}

      {mode === "create" && (
        <form className="form" onSubmit={handleCreate}>
          {user?.id ? (
            <p className="muted">
              Owner: <strong>{user.username}</strong> (#{user.id})
            </p>
          ) : (
            <div className="row">
              <label className="lbl-inline" style={{ flex: 1 }}>
                Owner ID
                <input
                  className="input"
                  value={ownerId}
                  onChange={(e) => setOwnerId(e.target.value)}
                  placeholder="User ID"
                />
              </label>
            </div>
          )}
          <div className="row">
            <label className="lbl-inline" style={{ flex: 2 }}>
              Name
              <input
                className="input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Item name"
              />
            </label>
          </div>
          <label className="lbl">
            Description
            <input
              className="input"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional"
            />
          </label>
          <label className="lbl">
            Price Estimate
            <input
              className="input"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Optional number"
            />
          </label>
          <div className="row">
            <button className="btn" type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Item"}
            </button>
          </div>
        </form>
      )}

      {mode === "user" && (
        <>
          <div className="row">
            <label className="lbl-inline" style={{ minWidth: 220 }}>
              Select User
              <select
                className="input"
                disabled={loadingUsers}
                value={userFilterId}
                onChange={(e) => setUserFilterId(e.target.value)}
              >
                <option value="">— choose —</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.username} (#{u.id})
                  </option>
                ))}
              </select>
            </label>
            <label className="lbl-inline" style={{ minWidth: 180 }}>
              Or enter ID
              <input
                className="input"
                placeholder="e.g. 1"
                value={userFilterId}
                onChange={(e) => setUserFilterId(e.target.value)}
              />
            </label>
            <button
              className="btn"
              onClick={() => loadItemsForUser(Number(userFilterId))}
              disabled={loading || !userFilterId}
            >
              {loading ? "Loading..." : "Load"}
            </button>
          </div>

          <div className="grid">
            {userItems.map((it) => (
              <div key={it.id} className="card inner">
                <div className="title">
                  {it.name} <span className="muted">#{it.id}</span>
                </div>
                <p className="muted">{it.description || "No description."}</p>
                <div className="row">
                  <span className="badge">${fmtMoney(it.price_estimate)}</span>
                  <span className="muted">owner #{it.owner_id}</span>
                </div>
                <div className="row" style={{ justifyContent: "flex-end" }}>
                  <button className="btn outline" onClick={() => handleDelete(it.id)}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
            {!userItems.length && !loading && userFilterId && (
              <p className="muted">No items found for user #{userFilterId}.</p>
            )}
          </div>
        </>
      )}
    </section>
  );
}



function isStrongPassword(pw) {
  return pw.length >= 8 && /[A-Z]/.test(pw) && /[0-9]/.test(pw) && /[^A-Za-z0-9]/.test(pw);
}
