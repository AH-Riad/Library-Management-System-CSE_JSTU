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

  const [image, setImage] = useState<File | null>(null);

  useEffect(() => {
    const auth = localStorage.getItem("admin_auth");
    if (auth === "true") setAuthorized(true);
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
    } catch {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authorized) fetchData();
  }, [authorized]);

  const addBook = async (e: any) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("title", title);
    formData.append("author", author);
    formData.append("category", category);
    formData.append("availableCopies", String(copies));

    if (image) formData.append("image", image);

    try {
      const res = await fetch("/api/books", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!data.success) {
        toast.error(data.message || "Failed");
        return;
      }

      toast.success("Book added");

      setTitle("");
      setAuthor("");
      setCategory("");
      setCopies(1);
      setImage(null);

      fetchData();
    } catch {
      toast.error("Server error");
    }
  };

  const approve = async (requestId: string) => {
    await fetch("/api/admin/approve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requestId }),
    });

    toast.success("Approved");
    fetchData();
  };

  const markReturned = async (requestId: string) => {
    await fetch("/api/admin/return", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requestId }),
    });

    toast.success("Returned");
    fetchData();
  };

  /* LOGIN */
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
        <h2>Admin Panel</h2>

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
              <h2>{books.length}</h2>
              <p>Books</p>
            </div>
            <div style={dashCard}>
              <h2>{pending.length}</h2>
              <p>Pending</p>
            </div>
            <div style={dashCard}>
              <h2>{returns.length}</h2>
              <p>Returns</p>
            </div>
          </div>
        )}

        {/* ADD BOOK */}
        {activeTab === "add" && (
          <form onSubmit={addBook} style={card}>
            <h2>Add Book</h2>

            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title"
              style={input}
            />
            <input
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="Author"
              style={input}
            />
            <input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Category"
              style={input}
            />

            <input
              type="number"
              value={copies}
              onChange={(e) => setCopies(Number(e.target.value))}
              style={input}
            />

            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImage(e.target.files?.[0] || null)}
              style={input}
            />

            <button style={btn}>Add Book</button>
          </form>
        )}

        {/* BOOKS */}
        {activeTab === "books" && (
          <div style={grid}>
            {books.map((b) => (
              <div key={b._id} style={glassCard}>
                {b.image && (
                  <div
                    style={{
                      width: "100%",
                      height: "200px",
                      background: "#f3f4f6",
                      borderRadius: "10px",
                      overflow: "hidden",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      marginBottom: "10px",
                    }}
                  >
                    <img
                      src={b.image}
                      alt={b.title}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "contain",
                      }}
                    />
                  </div>
                )}

                <h3>{b.title}</h3>
                <p>{b.author}</p>
                <p>{b.category}</p>
              </div>
            ))}
          </div>
        )}

        {/* REQUESTS (FIXED IMAGE ISSUE ONLY) */}
        {activeTab === "requests" && (
          <>
            <h2>Pending Requests</h2>

            <div style={grid}>
              {pending.map((r) => {
                const book = r.bookId || {};

                return (
                  <div key={r._id} style={glassCard}>
                    {(book.image || book.bookImage) && (
                      <div
                        style={{
                          width: "100%",
                          height: "180px",
                          background: "#f3f4f6",
                          borderRadius: "10px",
                          overflow: "hidden",
                          marginBottom: "10px",
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <img
                          src={book.image || book.bookImage}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "contain",
                          }}
                        />
                      </div>
                    )}

                    <h3>{book.title || "Unknown Book"}</h3>
                    <p>👤 {r.userName || r.userEmail || r.userId}</p>
                    <p>{r.userEmail}</p>

                    <button onClick={() => approve(r._id)} style={btn}>
                      Approve
                    </button>
                  </div>
                );
              })}
            </div>

            <h2 style={{ marginTop: 30 }}>Return Requests</h2>

            <div style={grid}>
              {returns.map((r) => {
                const book = r.bookId || {};

                return (
                  <div key={r._id} style={glassCard}>
                    {(book.image || book.bookImage) && (
                      <div
                        style={{
                          width: "100%",
                          height: "180px",
                          background: "#f3f4f6",
                          borderRadius: "10px",
                          overflow: "hidden",
                          marginBottom: "10px",
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <img
                          src={book.image || book.bookImage}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "contain",
                          }}
                        />
                      </div>
                    )}

                    <h3>{book.title || "Unknown Book"}</h3>
                    <p>👤 {r.userName || r.userEmail || r.userId}</p>

                    {r.fine > 0 && <p>💰 {r.fine} TK</p>}

                    <button onClick={() => markReturned(r._id)} style={btn}>
                      Mark Returned
                    </button>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* styles (UNCHANGED) */
const layout = { display: "flex", minHeight: "100vh" };
const sidebar = {
  width: 240,
  background: "#0f172a",
  color: "white",
  padding: 20,
  display: "flex",
  flexDirection: "column" as const,
  gap: 10,
};
const main = { flex: 1, padding: 20 };
const item = (a: boolean) => ({
  padding: 10,
  background: a ? "#2563eb" : "transparent",
  borderRadius: 8,
});
const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
  gap: 16,
};
const glassCard = {
  padding: 16,
  borderRadius: 16,
  background: "rgba(255,255,255,0.9)",
};
const dashGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(3,1fr)",
  gap: 16,
};
const dashCard = {
  padding: 20,
  borderRadius: 12,
  background: "rgba(255,255,255,0.9)",
  textAlign: "center" as const,
};
const input = { width: "100%", padding: 10, margin: "8px 0" };
const btn = {
  padding: 10,
  background: "#2563eb",
  color: "white",
  border: "none",
  borderRadius: 8,
  width: "100%",
};
const logoutBtn = {
  marginTop: "auto",
  background: "red",
  color: "white",
  padding: 10,
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
const card = { maxWidth: 400 };
