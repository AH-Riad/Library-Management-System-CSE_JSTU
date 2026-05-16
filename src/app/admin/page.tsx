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

  const addBook = async (e: any) => {
    e.preventDefault();

    if (!title || !author || !category) {
      toast.error("Fill all fields");
      return;
    }

    try {
      const res = await fetch("/api/books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          author: author.trim(),
          category: category.trim(),
          availableCopies: Number(copies) || 1,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        toast.error(data.message || "Failed to add book");
        return;
      }

      toast.success("Book added successfully");

      setTitle("");
      setAuthor("");
      setCategory("");
      setCopies(1);

      fetchData();
    } catch (err) {
      console.log(err);
      toast.error("Server error");
    }
  };

  const approve = async (requestId: string) => {
    try {
      const res = await fetch("/api/admin/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId }),
      });

      if (!res.ok) throw new Error();

      toast.success("Approved");
      fetchData();
    } catch {
      toast.error("Failed to approve");
    }
  };

  const markReturned = async (requestId: string) => {
    try {
      const res = await fetch("/api/admin/return", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId }),
      });

      if (!res.ok) throw new Error();

      toast.success("Marked returned");
      fetchData();
    } catch {
      toast.error("Failed to update return");
    }
  };

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

      <div style={main}>
        {loading && <p>Loading...</p>}

        {activeTab === "dashboard" && (
          <>
            <h1>Dashboard</h1>
            <p>Books: {books.length}</p>
            <p>Pending: {pending.length}</p>
            <p>Returns: {returns.length}</p>
          </>
        )}

        {activeTab === "add" && (
          <form onSubmit={addBook} style={card}>
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

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={input}
            >
              <option value="">Category</option>
              <option>Programming</option>
              <option>AI</option>
              <option>Database</option>
            </select>

            <input
              type="number"
              value={copies}
              onChange={(e) => setCopies(Number(e.target.value))}
              style={input}
            />

            <button style={btn}>Add</button>
          </form>
        )}

        {activeTab === "books" && (
          <div>
            <h2>Books</h2>

            {Array.isArray(books) && books.length > 0 ? (
              books.map((b) => (
                <div key={b._id} style={bookCard}>
                  <p>{b.title}</p>
                </div>
              ))
            ) : (
              <p>No books found</p>
            )}
          </div>
        )}

        {activeTab === "requests" && (
          <>
            <h2>Pending Requests</h2>

            {pending.map((r) => (
              <div key={r._id} style={requestCard}>
                <p>{r.bookId?.title}</p>
                <button onClick={() => approve(r._id)} style={buttonGreen}>
                  Approve
                </button>
              </div>
            ))}

            <h2>Return Requests</h2>

            {returns.map((r) => (
              <div key={r._id} style={requestCard}>
                <p>{r.bookId?.title}</p>
                <button onClick={() => markReturned(r._id)} style={buttonBlue}>
                  Mark Returned
                </button>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

/* STYLES (UNCHANGED) */
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

const item = (active: boolean) => ({
  padding: 10,
  cursor: "pointer",
  background: active ? "#2563eb" : "transparent",
  borderRadius: 8,
});

const main = { flex: 1, padding: 20 };

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
};

const buttonGreen = {
  padding: 8,
  background: "green",
  color: "white",
  marginRight: 10,
};

const buttonBlue = {
  padding: 8,
  background: "#2563eb",
  color: "white",
};

const requestCard = {
  border: "1px solid #ddd",
  padding: 10,
  marginTop: 10,
};

const bookCard = {
  border: "1px solid #ddd",
  padding: 10,
  marginTop: 10,
};

const card = { maxWidth: 400 };

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
  border: "1px solid #ddd",
};
