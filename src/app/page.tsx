"use client";

import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignOutButton,
  useUser,
} from "@clerk/nextjs";
import React, { Suspense, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useSearchParams } from "next/navigation";

function HomePageContent() {
  const { user } = useUser();
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const searchParams = useSearchParams();
  const [search, setSearch] = useState("");

  useEffect(() => {
    const q = searchParams.get("search") || "";
    setSearch(q);
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
          <h1 style={{ margin: 0 }}>📚 CSE Library System</h1>
        </div>

        <SignedIn>
          <SignOutButton>
            <button
              style={{
                color: "red",
                background: "transparent",
                border: "none",
              }}
            >
              Logout
            </button>
          </SignOutButton>
        </SignedIn>

        <SignedOut>
          <SignInButton>
            <button>Sign In</button>
          </SignInButton>
        </SignedOut>
      </div>

      <h2>Available Books</h2>

      {loading && <p>Loading...</p>}

      <div style={{ display: "grid", gap: 16 }}>
        {books
          .filter((b) => b.title?.toLowerCase().includes(search.toLowerCase()))
          .map((book) => (
            <div key={book._id}>
              <h3>{book.title}</h3>
              <p>{book.author}</p>
              <p>{book.category}</p>

              <button onClick={() => borrowBook(book._id)}>Borrow</button>
            </div>
          ))}
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <HomePageContent />
    </Suspense>
  );
}
