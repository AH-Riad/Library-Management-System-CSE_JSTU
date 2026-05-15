"use client";

import { useEffect, useState } from "react";

const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "12345";

export default function AdminPage() {
  const [authorized, setAuthorized] = useState(false);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [returnRequests, setReturnRequests] = useState<any[]>([]);
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // BOOK FORM STATES
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [category, setCategory] = useState("");
  const [image, setImage] = useState("");
  const [copies, setCopies] = useState(1);

  // LOGIN
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      setAuthorized(true);
      localStorage.setItem("admin_auth", "true");
    } else {
      alert("Invalid credentials");
    }
  };

  // AUTH CHECK
  useEffect(() => {
    const auth = localStorage.getItem("admin_auth");
    if (auth === "true") setAuthorized(true);
  }, []);

  // LOAD DATA
  useEffect(() => {
    if (!authorized) return;
    fetchData();
  }, [authorized]);

  const fetchData = async () => {
    try {
      setLoading(true);

      const [pendingRes, returnRes, booksRes] = await Promise.all([
        fetch("/api/admin/requests/pending"),
        fetch("/api/admin/requests/return"),
        fetch("/api/books"),
      ]);

      const pendingData = await pendingRes.json();
      const returnData = await returnRes.json();
      const booksData = await booksRes.json();

      setPendingRequests(pendingData.requests || []);
      setReturnRequests(returnData.requests || []);
      setBooks(booksData.books || []);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  // ADD BOOK
  const addBook = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch("/api/books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          author,
          category,
          image,
          availableCopies: copies,
        }),
      });

      const data = await res.json();

      alert(data.message || "Book added");

      // reset form
      setTitle("");
      setAuthor("");
      setCategory("");
      setImage("");
      setCopies(1);

      fetchData();
    } catch (err) {
      console.log(err);
    }
  };

  // DELETE BOOK
  const deleteBook = async (id: string) => {
    if (!confirm("Delete this book?")) return;

    try {
      const res = await fetch(`/api/books/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      alert(data.message || "Deleted");

      fetchData();
    } catch (err) {
      console.log(err);
    }
  };

  // BORROW APPROVE
  const approveBorrow = async (id: string) => {
    await fetch("/api/admin/approve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requestId: id }),
    });

    fetchData();
  };

  // RETURN APPROVE
  const approveReturn = async (id: string) => {
    await fetch("/api/admin/return", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requestId: id }),
    });

    fetchData();
  };

  const logout = () => {
    localStorage.removeItem("admin_auth");
    setAuthorized(false);
  };

  // LOGIN PAGE
  if (!authorized) {
    return (
      <div style={center}>
        <form onSubmit={handleLogin} style={card}>
          <h1>Admin Login</h1>

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

          <button style={btnBlue}>Login</button>
        </form>
      </div>
    );
  }

  return (
    <div style={{ padding: 20 }}>
      <div style={topBar}>
        <h1>Admin Dashboard</h1>
        <button onClick={logout} style={btnRed}>
          Logout
        </button>
      </div>

      {/* ADD BOOK */}
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

        {/* CATEGORY DROPDOWN */}
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          style={input}
        >
          <option value="">Select Category</option>
          <option value="Programming">Programming</option>
          <option value="AI">AI</option>
          <option value="Database">Database</option>
          <option value="Networking">Networking</option>
          <option value="Math">Math</option>
        </select>

        {/* IMAGE */}
        <input
          placeholder="Image URL"
          value={image}
          onChange={(e) => setImage(e.target.value)}
          style={input}
        />

        <input
          type="number"
          placeholder="Copies"
          value={copies}
          onChange={(e) => setCopies(Number(e.target.value))}
          style={input}
        />

        <button style={btnGreen}>Add Book</button>
      </form>

      {/* BOOK LIST */}
      <h2>Books</h2>

      <div style={grid}>
        {books.map((b) => (
          <div key={b._id} style={card}>
            <img
              src={b.image || "https://placehold.co/400x300"}
              style={{ width: "100%", height: 180, objectFit: "cover" }}
            />

            <h3>{b.title}</h3>
            <p>{b.author}</p>
            <p>{b.category}</p>

            <button onClick={() => deleteBook(b._id)} style={btnRed}>
              Delete
            </button>
          </div>
        ))}
      </div>

      {/* REQUESTS */}
      <h2>Borrow Requests</h2>
      {pendingRequests.map((r) => (
        <div key={r._id} style={card}>
          <p>{r.bookId?.title}</p>
          <button onClick={() => approveBorrow(r._id)} style={btnBlue}>
            Approve
          </button>
        </div>
      ))}

      <h2>Return Requests</h2>
      {returnRequests.map((r) => (
        <div key={r._id} style={card}>
          <p>{r.bookId?.title}</p>
          <button onClick={() => approveReturn(r._id)} style={btnGreen}>
            Mark Returned
          </button>
        </div>
      ))}
    </div>
  );
}

// STYLES
const center = {
  display: "flex",
  height: "100vh",
  justifyContent: "center",
  alignItems: "center",
};

const topBar = {
  display: "flex",
  justifyContent: "space-between",
  marginBottom: 20,
};

const card = {
  padding: 15,
  border: "1px solid #ddd",
  borderRadius: 10,
  marginBottom: 10,
};

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))",
  gap: 10,
};

const input = {
  display: "block",
  width: "100%",
  marginBottom: 10,
  padding: 10,
};

const btnBlue = {
  background: "blue",
  color: "white",
  padding: 10,
  border: "none",
};

const btnGreen = {
  background: "green",
  color: "white",
  padding: 10,
  border: "none",
};

const btnRed = {
  background: "red",
  color: "white",
  padding: 10,
  border: "none",
};
