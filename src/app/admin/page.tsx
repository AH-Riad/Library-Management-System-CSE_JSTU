"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function AdminPage() {
  const [authorized, setAuthorized] = useState(false);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [books, setBooks] = useState<any[]>([]);
  const [pending, setPending] = useState<any[]>([]);
  const [returns, setReturns] = useState<any[]>([]);

  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(false);

  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [category, setCategory] = useState("");
  const [copies, setCopies] = useState(1);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const auth = localStorage.getItem("admin_auth");
      if (auth === "true") setAuthorized(true);
    }
  }, []);

  const login = (e: any) => {
    e.preventDefault();

    if (username === "admin" && password === "12345") {
      localStorage.setItem("admin_auth", "true");
      setAuthorized(true);
      toast.success("Login successful");
    } else {
      toast.error("Wrong credentials");
    }
  };

  const logout = () => {
    localStorage.removeItem("admin_auth");
    setAuthorized(false);
    toast.success("Logged out");
  };

  const fetchData = async () => {
    setLoading(true);

    try {
      const [b, p, r] = await Promise.all([
        fetch("/api/books"),
        fetch("/api/admin/requests/pending"),
        fetch("/api/admin/requests/return"),
      ]);

      const bd = await b.json();
      const pd = await p.json();
      const rd = await r.json();

      setBooks(bd?.books || []);
      setPending(pd?.requests || []);
      setReturns(rd?.requests || []);
    } catch (err) {
      console.log(err);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authorized) fetchData();
  }, [authorized]);

  const approve = async (requestId: string) => {
    try {
      await fetch("/api/admin/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId }),
      });

      toast.success("Approved");
      fetchData();
    } catch {
      toast.error("Failed");
    }
  };

  const markReturned = async (requestId: string) => {
    try {
      await fetch("/api/admin/return", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId }),
      });

      toast.success("Returned");
      fetchData();
    } catch {
      toast.error("Failed");
    }
  };

  /* ================= LOGIN ================= */
  if (!authorized) {
    return (
      <div style={loginWrapper}>
        <form onSubmit={login} style={loginCard}>
          <h2>Admin Login</h2>

          <input
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={input}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={input}
          />

          <button style={btn}>Login</button>
        </form>
      </div>
    );
  }

  return (
    <div style={layout}>
      {/* SIDEBAR */}
      <div style={sidebar}>
        <h2 style={{ marginBottom: 20 }}>Admin Panel</h2>

        {["dashboard", "books", "add", "requests"].map((tab) => (
          <div
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={item(activeTab === tab)}
          >
            {tab.toUpperCase()}
          </div>
        ))}

        <button onClick={logout} style={logoutBtn}>
          Logout
        </button>
      </div>

      {/* MAIN */}
      <div style={main}>
        {loading && <p>Loading...</p>}

        {/* DASHBOARD */}
        {activeTab === "dashboard" && (
          <div style={dashGrid}>
            <div style={dashCard}>
              📚<h3>{books.length}</h3>
              <p>Books</p>
            </div>
            <div style={dashCard}>
              ⏳<h3>{pending.length}</h3>
              <p>Pending</p>
            </div>
            <div style={dashCard}>
              🔁<h3>{returns.length}</h3>
              <p>Returns</p>
            </div>
          </div>
        )}

        {/* ADD BOOK */}
        {activeTab === "add" && (
          <form onSubmit={(e) => e.preventDefault()} style={card}>
            <h2>Add Book</h2>
            <input
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={input}
            />
            <input
              placeholder="Author"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              style={input}
            />
            <input
              placeholder="Category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={input}
            />

            <input
              type="number"
              value={copies}
              onChange={(e) => setCopies(Number(e.target.value))}
              style={input}
            />

            <button style={btn}>Add</button>
          </form>
        )}

        {/* BOOKS GRID */}
        {activeTab === "books" && (
          <div>
            <h2>Books</h2>

            <div style={grid}>
              {books.map((b) => (
                <div key={b._id} style={glassCard}>
                  <h3>{b.title}</h3>
                  <p>{b.author}</p>
                  <span>{b.category}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* REQUESTS GRID */}
        {activeTab === "requests" && (
          <>
            <h2>Pending Requests</h2>

            <div style={grid}>
              {pending.map((r) => (
                <div key={r._id} style={glassCard}>
                  <h3>{r.bookId?.title}</h3>
                  <p>👤 {r.userName}</p>
                  <p>📧 {r.userEmail}</p>

                  <button onClick={() => approve(r._id)} style={btnSmall}>
                    Approve
                  </button>
                </div>
              ))}
            </div>

            <h2 style={{ marginTop: 30 }}>Return Requests</h2>

            <div style={grid}>
              {returns.map((r) => (
                <div key={r._id} style={glassCard}>
                  <h3>{r.bookId?.title}</h3>
                  <p>👤 {r.userName}</p>
                  <p>📧 {r.userEmail}</p>

                  {r.fine > 0 && <p style={{ color: "red" }}>💰 {r.fine} TK</p>}

                  <button onClick={() => markReturned(r._id)} style={btnSmall}>
                    Mark Returned
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ================= STYLES ================= */

const layout = { display: "flex", minHeight: "100vh", background: "#0b1220" };

const sidebar = {
  width: 240,
  background: "#0f172a",
  color: "white",
  padding: 20,
  display: "flex",
  flexDirection: "column" as const,
  gap: 10,
};

const main = { flex: 1, padding: 20, color: "white" };

const item = (active: boolean) => ({
  padding: 10,
  borderRadius: 8,
  cursor: "pointer",
  background: active ? "#2563eb" : "transparent",
});

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
  gap: 16,
  marginTop: 10,
};

const glassCard = {
  padding: 16,
  borderRadius: 16,
  background: "rgba(255,255,255,0.08)",
  backdropFilter: "blur(14px)",
  border: "1px solid rgba(255,255,255,0.15)",
  boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
};

const dashGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  gap: 16,
};

const dashCard = {
  padding: 20,
  borderRadius: 16,
  background: "rgba(255,255,255,0.08)",
  textAlign: "center" as const,
};

const input = {
  width: "100%",
  padding: 10,
  margin: "8px 0",
};

const btn = {
  padding: 10,
  background: "#2563eb",
  color: "white",
  border: "none",
  borderRadius: 10,
  cursor: "pointer",
};

const btnSmall = {
  marginTop: 10,
  padding: "8px 12px",
  background: "#2563eb",
  color: "white",
  border: "none",
  borderRadius: 8,
};

const logoutBtn = {
  marginTop: "auto",
  background: "red",
  color: "white",
  padding: 10,
  border: "none",
  borderRadius: 8,
};

const card = {
  maxWidth: 400,
};

const loginWrapper = {
  height: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};

const loginCard = {
  padding: 20,
  borderRadius: 12,
  background: "white",
  width: 320,
};
