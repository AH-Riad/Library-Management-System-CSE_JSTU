"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { SignedIn, SignedOut, UserButton, SignInButton } from "@clerk/nextjs";

export default function Navbar() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState("");

  // keep input synced with url
  useEffect(() => {
    const q = searchParams.get("search");

    if (q) {
      setQuery(q);
    }
  }, [searchParams]);

  // SEARCH FUNCTION
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    if (!query.trim()) {
      router.push("/");
      return;
    }

    router.push(`/?search=${encodeURIComponent(query)}`);
  };

  return (
    <nav
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "14px 28px",
        background: "#0f172a",
        color: "white",
        position: "sticky",
        top: 0,
        zIndex: 100,
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        backdropFilter: "blur(10px)",
      }}
    >
      {/* LEFT */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "14px",
          minWidth: "230px",
        }}
      >
        {/* LOGO */}
        <div
          style={{
            width: "46px",
            height: "46px",
            borderRadius: "12px",
            background: "linear-gradient(135deg,#2563eb,#06b6d4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: "bold",
            fontSize: "14px",
            boxShadow: "0 4px 14px rgba(37,99,235,0.35)",
          }}
        >
          CSE
        </div>

        <div>
          <h2
            style={{
              margin: 0,
              fontSize: "22px",
              fontWeight: "700",
              letterSpacing: "0.5px",
            }}
          >
            CSE Library
          </h2>

          <p
            style={{
              margin: 0,
              fontSize: "12px",
              opacity: 0.7,
            }}
          >
            Digital Library System
          </p>
        </div>
      </div>

      {/* SEARCH */}
      <form
        onSubmit={handleSearch}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          flex: 1,
          maxWidth: "580px",
          margin: "0 28px",
        }}
      >
        <input
          type="text"
          placeholder="Search books by title..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{
            flex: 1,
            padding: "12px 16px",
            borderRadius: "12px",
            border: "1px solid rgba(255,255,255,0.08)",
            outline: "none",
            fontSize: "15px",
            background: "#1e293b",
            color: "white",
          }}
        />

        <button
          type="submit"
          style={{
            padding: "12px 18px",
            borderRadius: "12px",
            border: "none",
            background: "linear-gradient(135deg,#2563eb,#3b82f6)",
            color: "white",
            fontWeight: "700",
            cursor: "pointer",
            transition: "0.2s",
            boxShadow: "0 4px 14px rgba(37,99,235,0.35)",
          }}
        >
          Search
        </button>
      </form>

      {/* RIGHT */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
        }}
      >
        <NavButton href="/" label="Home" color="#2563eb" />

        <NavButton href="/profile" label="My Profile" color="#7c3aed" />

        <NavButton href="/admin" label="Admin" color="#059669" />

        {/* AUTH */}
        <SignedOut>
          <SignInButton mode="modal">
            <button
              style={{
                padding: "10px 18px",
                borderRadius: "10px",
                border: "none",
                background: "linear-gradient(135deg,#f59e0b,#f97316)",
                color: "white",
                fontWeight: "700",
                cursor: "pointer",
                boxShadow: "0 4px 14px rgba(249,115,22,0.35)",
              }}
            >
              Sign In
            </button>
          </SignInButton>
        </SignedOut>

        <SignedIn>
          <div
            style={{
              marginLeft: "4px",
            }}
          >
            <UserButton afterSignOutUrl="/" />
          </div>
        </SignedIn>
      </div>
    </nav>
  );
}

// NAV BUTTON COMPONENT
function NavButton({
  href,
  label,
  color,
}: {
  href: string;
  label: string;
  color: string;
}) {
  return (
    <Link
      href={href}
      style={{
        textDecoration: "none",
        color: "white",
        background: color,
        padding: "10px 16px",
        borderRadius: "10px",
        fontWeight: "600",
        fontSize: "14px",
        transition: "0.2s",
        boxShadow: `0 4px 12px ${color}55`,
      }}
    >
      {label}
    </Link>
  );
}
