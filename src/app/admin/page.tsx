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
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
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

  useEffect(() => {
    if (!mobileNavOpen) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileNavOpen(false);
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [mobileNavOpen]);

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
      <div className="library-admin-login" style={loginWrapper}>
        <form
          onSubmit={login}
          className="library-admin-login-card"
          style={loginCard}
        >
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
    <div className="library-admin-page">
      <div className="library-admin-layout" style={layout}>
        {/* Mobile-only admin navigation toggle. Desktop layout remains unchanged. */}
        <div className="library-admin-mobile-header">
          <h2>Admin Panel</h2>
          <button
            type="button"
            className="library-admin-mobile-toggle"
            aria-expanded={mobileNavOpen}
            aria-controls="library-admin-sidebar"
            onClick={() => setMobileNavOpen((open) => !open)}
          >
            {mobileNavOpen ? "Close Menu" : "Menu"}
          </button>
        </div>

        {/* SIDEBAR */}
        <div
          id="library-admin-sidebar"
          className={`library-admin-sidebar${mobileNavOpen ? " library-admin-sidebar-open" : ""}`}
          style={sidebar}
        >
          <h2>Admin Panel</h2>

          {["dashboard", "books", "add", "requests"].map((tab) => (
            <div
              key={tab}
              role="button"
              tabIndex={0}
              aria-pressed={activeTab === tab}
              onClick={() => {
                setActiveTab(tab);
                setMobileNavOpen(false);
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  setActiveTab(tab);
                  setMobileNavOpen(false);
                }
              }}
              style={item(activeTab === tab)}
            >
              {tab.toUpperCase()}
            </div>
          ))}

          <button
            onClick={() => {
              setMobileNavOpen(false);
              logout();
            }}
            style={logoutBtn}
          >
            Logout
          </button>
        </div>

        {/* MAIN */}
        <div className="library-admin-main" style={main}>
          {loading && <p>Loading...</p>}

          {/* DASHBOARD */}
          {activeTab === "dashboard" && (
            <div className="library-admin-stats" style={dashGrid}>
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
            <form onSubmit={addBook} className="library-admin-add" style={card}>
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
            <div className="library-admin-grid" style={grid}>
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

              <div className="library-admin-grid" style={grid}>
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

              <div className="library-admin-grid" style={grid}>
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

      {/* The backdrop closes the mobile drawer when the user taps outside it. */}
      {mobileNavOpen && (
        <button
          type="button"
          className="library-admin-backdrop"
          aria-label="Close admin navigation"
          onClick={() => setMobileNavOpen(false)}
        />
      )}

      {/* Admin-specific mobile rules live here so the fix does not depend on global.css. */}
      <style jsx global>{`
        .library-admin-page {
          width: 100%;
          min-width: 0;
        }

        .library-admin-mobile-header,
        .library-admin-backdrop {
          display: none;
        }

        @media (max-width: 768px) {
          .library-admin-page {
            position: relative !important;
            z-index: 0 !important;
            isolation: isolate;
            width: 100%;
            min-width: 0;
          }

          .library-admin-page .library-admin-layout {
            position: relative !important;
            display: flex !important;
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            min-width: 0 !important;
            min-height: auto !important;
            box-sizing: border-box !important;
          }

          .library-admin-page .library-admin-mobile-header {
            position: relative;
            z-index: 12;
            display: flex !important;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
            width: 100%;
            min-width: 0;
            box-sizing: border-box;
            padding: 12px 14px;
            background: #0f172a;
            color: #ffffff;
          }

          .library-admin-page .library-admin-mobile-header h2 {
            margin: 0;
            font-size: 18px;
            line-height: 1.3;
            overflow-wrap: anywhere;
          }

          .library-admin-page .library-admin-mobile-toggle {
            display: inline-flex;
            flex: 0 0 auto;
            align-items: center;
            justify-content: center;
            min-height: 42px;
            padding: 9px 14px;
            border: 0;
            border-radius: 8px;
            background: #2563eb;
            color: #ffffff;
            font: inherit;
            font-size: 14px;
            font-weight: 600;
            white-space: nowrap;
            cursor: pointer;
            -webkit-tap-highlight-color: transparent;
          }

          /* Keep the drawer inside the admin panel, below the site's main navbar
             and below the Admin Panel mobile header. It must not cover the app navbar. */
          .library-admin-page .library-admin-sidebar {
            position: absolute !important;
            z-index: 11 !important;
            top: 66px !important;
            right: auto !important;
            bottom: auto !important;
            left: 0 !important;
            display: flex !important;
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 8px !important;
            width: min(78vw, 270px) !important;
            max-width: calc(100% - 24px) !important;
            height: auto !important;
            min-width: 0 !important;
            max-height: min(420px, calc(100dvh - 160px)) !important;
            box-sizing: border-box !important;
            padding: 16px 12px !important;
            overflow-x: hidden !important;
            overflow-y: auto !important;
            overscroll-behavior: contain;
            border-radius: 0 14px 14px 0 !important;
            background: #0f172a !important;
            box-shadow: 10px 12px 28px rgba(0, 0, 0, 0.24);
            transform: translateX(-110%) !important;
            visibility: hidden !important;
            pointer-events: none !important;
            transition:
              transform 200ms ease,
              visibility 200ms ease;
          }

          .library-admin-page
            .library-admin-sidebar.library-admin-sidebar-open {
            transform: translateX(0) !important;
            visibility: visible !important;
            pointer-events: auto !important;
          }

          .library-admin-page .library-admin-sidebar h2 {
            display: block !important;
            margin: 0 0 8px !important;
            color: #ffffff;
            font-size: 21px;
            line-height: 1.3;
          }

          .library-admin-page .library-admin-sidebar > div {
            display: flex;
            align-items: center;
            flex: 0 0 auto;
            width: 100%;
            min-width: 0;
            min-height: 46px;
            box-sizing: border-box;
            padding: 12px !important;
            color: #ffffff;
            overflow-wrap: anywhere;
            cursor: pointer;
            touch-action: manipulation;
            -webkit-tap-highlight-color: transparent;
          }

          .library-admin-page .library-admin-sidebar > div:focus-visible,
          .library-admin-page .library-admin-sidebar > button:focus-visible,
          .library-admin-page .library-admin-mobile-toggle:focus-visible {
            outline: 2px solid #93c5fd;
            outline-offset: 2px;
          }

          .library-admin-page .library-admin-sidebar > button {
            flex: 0 0 auto;
            width: 100%;
            min-height: 44px;
            box-sizing: border-box;
            margin-top: auto !important;
            cursor: pointer;
            touch-action: manipulation;
          }

          .library-admin-page .library-admin-backdrop {
            position: absolute !important;
            z-index: 10 !important;
            top: 66px !important;
            right: 0 !important;
            bottom: 0 !important;
            left: 0 !important;
            display: block !important;
            width: 100% !important;
            height: auto !important;
            margin: 0 !important;
            padding: 0 !important;
            border: 0 !important;
            border-radius: 0 !important;
            background: rgba(15, 23, 42, 0.42) !important;
            cursor: pointer;
            touch-action: manipulation;
          }

          .library-admin-page .library-admin-main {
            display: block;
            flex: 1 1 auto !important;
            width: 100% !important;
            max-width: 100% !important;
            min-width: 0 !important;
            box-sizing: border-box !important;
            padding: 14px 12px !important;
            overflow-x: clip;
          }

          .library-admin-page .library-admin-main > * {
            max-width: 100%;
            min-width: 0;
          }

          .library-admin-page .library-admin-main h2,
          .library-admin-page .library-admin-main h3,
          .library-admin-page .library-admin-main p,
          .library-admin-page .library-admin-main label {
            max-width: 100%;
            overflow-wrap: anywhere;
            word-break: normal;
          }

          .library-admin-page .library-admin-stats {
            display: grid !important;
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 10px !important;
            width: 100%;
            min-width: 0;
          }

          .library-admin-page .library-admin-stats > * {
            min-width: 0;
            box-sizing: border-box;
            padding: 12px !important;
            overflow-wrap: anywhere;
          }

          .library-admin-page .library-admin-stats h2 {
            margin-top: 0;
            font-size: clamp(22px, 6vw, 28px);
          }

          .library-admin-page .library-admin-grid {
            display: grid !important;
            grid-template-columns: minmax(0, 1fr) !important;
            gap: 12px !important;
            width: 100%;
            min-width: 0;
          }

          .library-admin-page .library-admin-grid > * {
            width: 100%;
            max-width: 100%;
            min-width: 0;
            box-sizing: border-box;
            padding: 12px !important;
            overflow-wrap: anywhere;
          }

          .library-admin-page .library-admin-grid img {
            display: block;
            max-width: 100%;
          }

          .library-admin-page .library-admin-add {
            width: 100% !important;
            max-width: 100% !important;
            min-width: 0;
            box-sizing: border-box;
          }

          .library-admin-page .library-admin-add input,
          .library-admin-page .library-admin-add button,
          .library-admin-page .library-admin-login-card input,
          .library-admin-page .library-admin-login-card button {
            width: 100%;
            max-width: 100%;
            min-width: 0;
            box-sizing: border-box;
            font-size: 16px;
          }

          .library-admin-page .library-admin-login {
            width: 100%;
            height: auto !important;
            min-height: calc(100dvh - 100px);
            box-sizing: border-box;
            padding: 20px 12px;
          }

          .library-admin-page .library-admin-login-card {
            width: min(100%, 360px) !important;
            min-width: 0;
            box-sizing: border-box;
          }
        }

        @media (max-width: 380px) {
          .library-admin-page .library-admin-main {
            padding-right: 10px !important;
            padding-left: 10px !important;
          }

          .library-admin-page .library-admin-stats > * {
            padding: 10px !important;
          }

          .library-admin-page .library-admin-stats p {
            font-size: 13px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .library-admin-page .library-admin-sidebar {
            transition: none !important;
          }
        }
      `}</style>
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
