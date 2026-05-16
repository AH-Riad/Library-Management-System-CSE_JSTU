"use client";

import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignOutButton,
  useUser,
} from "@clerk/nextjs";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useSearchParams } from "next/navigation";

export default function HomePage() {
  const { user } = useUser();
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const searchParams = useSearchParams();

  // ✅ FIX: make search reactive
  const [search, setSearch] = useState("");

  useEffect(() => {
    setSearch(searchParams.get("search") || "");
  }, [searchParams]);

  useEffect(() => {
    const fetchBooks = async () => {
      setLoading(true);

      try {
        const res = await fetch("/api/books");
        const data = await res.json();

        if (data?.success) {
          setBooks(data.books || []);
        } else {
          toast.error(data?.message || "Failed to load books");
        }
      } catch (err) {
        console.log(err);
        toast.error("Server error while loading books");
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  const borrowBook = async (bookId: string) => {
    if (!user?.id) {
      toast.error("Please sign in first");
      return;
    }

    try {
      const res = await fetch("/api/borrow/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          bookId,
        }),
      });

      const data = await res.json();

      if (data?.success) {
        toast.success(data.message || "Request sent successfully");
      } else {
        toast.error(data?.message || "Failed to send request");
      }
    } catch (err) {
      console.log(err);
      toast.error("Something went wrong");
    }
  };

  return (
    <div style={{ padding: "24px", maxWidth: "1100px", margin: "0 auto" }}>
      {/* HEADER CARD (UNCHANGED) */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "16px 20px",
          borderRadius: "14px",
          background: "linear-gradient(135deg, #1e293b, #0f172a)",
          color: "white",
          marginBottom: "20px",
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: "22px" }}>📚 CSE Library System</h1>
          <p style={{ margin: 0, fontSize: "13px", opacity: 0.7 }}>
            Manage and borrow books easily
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <SignedOut>
            <SignInButton>
              <button
                style={{
                  padding: "8px 14px",
                  borderRadius: "10px",
                  border: "none",
                  background: "#2563eb",
                  color: "white",
                  cursor: "pointer",
                }}
              >
                Sign In
              </button>
            </SignInButton>
          </SignedOut>

          <SignedIn>
            <div style={{ textAlign: "right" }}>
              <p style={{ margin: 0, fontSize: "14px" }}>
                👋 {user?.firstName || "User"}
              </p>
              <SignOutButton>
                <button
                  style={{
                    marginTop: "4px",
                    fontSize: "12px",
                    color: "#f87171",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  Logout
                </button>
              </SignOutButton>
            </div>
          </SignedIn>
        </div>
      </div>

      {/* CONTENT */}
      <h2 style={{ marginTop: "10px" }}>Available Books</h2>

      {loading && <p style={{ color: "#666" }}>Loading books...</p>}

      {!loading && books.length === 0 && (
        <p style={{ color: "#888" }}>No books available right now.</p>
      )}

      {/* GRID */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
          gap: "18px",
          marginTop: "16px",
        }}
      >
        {books
          .filter((book) =>
            book.title?.toLowerCase().includes(search.toLowerCase()),
          )
          .map((book) => (
            <div
              key={book._id}
              style={{
                borderRadius: "14px",
                padding: "16px",
                background: "white",
                boxShadow: "0 6px 16px rgba(0,0,0,0.08)",
                border: "1px solid #e5e7eb",
                transition: "0.2s",
              }}
            >
              <h3 style={{ marginBottom: "6px" }}>{book.title}</h3>
              <p style={{ margin: 0, color: "#555" }}>👤 {book.author}</p>
              <p style={{ margin: "6px 0", color: "#666" }}>
                🏷 {book.category}
              </p>

              <button
                onClick={() => borrowBook(book._id)}
                style={{
                  marginTop: "12px",
                  padding: "10px",
                  background: "#2563eb",
                  color: "white",
                  border: "none",
                  borderRadius: "10px",
                  cursor: "pointer",
                  width: "100%",
                  fontWeight: 500,
                }}
              >
                Borrow Book
              </button>
            </div>
          ))}
      </div>
    </div>
  );
}
