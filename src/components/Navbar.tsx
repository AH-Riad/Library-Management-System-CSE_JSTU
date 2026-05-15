"use client";

import Link from "next/link";
import { useState } from "react";

import { SignedIn, SignedOut, UserButton, SignInButton } from "@clerk/nextjs";

export default function Navbar() {
  const [query, setQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    if (!query.trim()) return;

    alert(`Searching for: ${query}`);
  };

  return (
    <nav
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "14px 24px",
        background: "#0f172a",
        color: "white",
        position: "sticky",
        top: 0,
        zIndex: 100,
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
      }}
    >
      {/* LEFT */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          minWidth: "220px",
        }}
      >
        {/* LOGO PLACEHOLDER */}
        <div
          style={{
            width: "42px",
            height: "42px",
            borderRadius: "10px",
            background: "linear-gradient(135deg, #3b82f6, #06b6d4)",
          }}
        />

        <h2
          style={{
            margin: 0,
            fontSize: "22px",
            fontWeight: "bold",
          }}
        >
          CSE Library
        </h2>
      </div>

      {/* CENTER SEARCH */}
      <form
        onSubmit={handleSearch}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          flex: 1,
          maxWidth: "520px",
          margin: "0 24px",
        }}
      >
        <input
          type="text"
          placeholder="Search books by name..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{
            flex: 1,
            padding: "10px 14px",
            borderRadius: "10px",
            border: "none",
            outline: "none",
            fontSize: "15px",
          }}
        />

        <button
          type="submit"
          style={{
            padding: "10px 18px",
            borderRadius: "10px",
            border: "none",
            background: "#3b82f6",
            color: "white",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          Search
        </button>
      </form>

      {/* RIGHT NAV */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "14px",
        }}
      >
        <Link
          href="/"
          style={{
            textDecoration: "none",
            color: "white",
            background: "#2563eb",
            padding: "8px 14px",
            borderRadius: "8px",
            fontWeight: "500",
          }}
        >
          Home
        </Link>

        <Link
          href="/profile"
          style={{
            textDecoration: "none",
            color: "white",
            background: "#7c3aed",
            padding: "8px 14px",
            borderRadius: "8px",
            fontWeight: "500",
          }}
        >
          My Profile
        </Link>

        <Link
          href="/admin"
          style={{
            textDecoration: "none",
            color: "white",
            background: "#059669",
            padding: "8px 14px",
            borderRadius: "8px",
            fontWeight: "500",
          }}
        >
          Admin
        </Link>

        {/* AUTH */}
        <SignedOut>
          <SignInButton mode="modal">
            <button
              style={{
                padding: "8px 16px",
                borderRadius: "8px",
                border: "none",
                background: "#f59e0b",
                color: "white",
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              Sign In
            </button>
          </SignInButton>
        </SignedOut>

        <SignedIn>
          <UserButton afterSignOutUrl="/" />
        </SignedIn>
      </div>
    </nav>
  );
}
