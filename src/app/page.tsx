"use client";

import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignOutButton,
  useUser,
} from "@clerk/nextjs";
import React, { useEffect, useState } from "react";

export default function HomePage() {
  const { user } = useUser();
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchBooks = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/books");
        const data = await res.json();

        if (data.success) {
          setBooks(data.books);
        }
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  const borrowBook = async (bookId: string) => {
    if (!user?.id) {
      alert("Please sign in first");
      return;
    }

    try {
      const res = await fetch("/api/borrow/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          bookId,
        }),
      });

      const data = await res.json();
      alert(data.message || "Request sent");
    } catch (err) {
      alert("Something went wrong");
    }
  };

  return (
    <div style={{ padding: "24px", maxWidth: "1100px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "28px", fontWeight: "bold" }}>
        📚 CSE Library System
      </h1>

      {/* AUTH */}
      <div style={{ marginTop: "12px", marginBottom: "20px" }}>
        <SignedOut>
          <SignInButton />
        </SignedOut>

        <SignedIn>
          <p>Welcome, {user?.firstName}</p>
          <SignOutButton />
        </SignedIn>
      </div>

      <hr />

      {/* BOOK LIST */}
      <h2 style={{ marginTop: "20px" }}>Available Books</h2>

      {loading && <p>Loading books...</p>}

      {!loading && books.length === 0 && <p>No books available right now.</p>}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
          gap: "16px",
          marginTop: "16px",
        }}
      >
        {books.map((book) => (
          <div
            key={book._id}
            style={{
              border: "1px solid #ddd",
              borderRadius: "12px",
              padding: "14px",
              background: "#fff",
              boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
            }}
          >
            <h3 style={{ marginBottom: "6px" }}>{book.title}</h3>
            <p style={{ margin: 0 }}>👤 {book.author}</p>
            <p style={{ margin: "6px 0" }}>🏷 {book.category}</p>

            <button
              onClick={() => borrowBook(book._id)}
              style={{
                marginTop: "10px",
                padding: "8px 12px",
                background: "#2563eb",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                width: "100%",
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
