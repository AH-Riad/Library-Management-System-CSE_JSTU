"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { SignedIn, SignedOut, UserButton, SignInButton } from "@clerk/nextjs";

function NavbarContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState("");

  useEffect(() => {
    const q = searchParams.get("search") || "";
    setQuery(q);
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    const trimmed = query.trim();

    if (!trimmed) {
      router.push("/");
      return;
    }

    router.push(`/?search=${encodeURIComponent(trimmed)}`);
  };

  return (
    <nav style={styles.nav}>
      <Link href="/" style={styles.left}>
        <div style={styles.logoWrapper}>
          <Image
            src="/logo.webp"
            alt="University Logo"
            width={52}
            height={52}
            priority
            style={styles.logoImage}
          />
        </div>

        <div>
          <h2 style={styles.title}>CSE Library</h2>
          <p style={styles.subtitle}>Digital Library System</p>
        </div>
      </Link>

      <form onSubmit={handleSearch} style={styles.searchBox}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search books..."
          style={styles.input}
        />

        <button type="submit" style={styles.searchBtn}>
          Search
        </button>
      </form>

      <div style={styles.right}>
        <Link style={styles.link} href="/">
          Home
        </Link>
        <Link style={styles.link} href="/profile">
          Profile
        </Link>
        <Link style={styles.link} href="/admin">
          Admin
        </Link>

        <SignedOut>
          <SignInButton mode="modal">
            <button style={styles.signInBtn}>Sign In</button>
          </SignInButton>
        </SignedOut>

        <SignedIn>
          <UserButton afterSignOutUrl="/" />
        </SignedIn>
      </div>
    </nav>
  );
}

export default function Navbar() {
  return (
    <Suspense fallback={null}>
      <NavbarContent />
    </Suspense>
  );
}

/* STYLES */
const styles: Record<string, React.CSSProperties> = {
  nav: {
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
  },

  left: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    minWidth: "230px",
    textDecoration: "none",
    color: "white",
  },

  logoWrapper: {
    width: "52px",
    height: "52px",
    borderRadius: "12px",
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "white",
  },

  logoImage: {
    objectFit: "contain",
  },

  title: {
    margin: 0,
    fontSize: "20px",
  },

  subtitle: {
    margin: 0,
    fontSize: "12px",
    opacity: 0.7,
  },

  searchBox: {
    display: "flex",
    flex: 1,
    maxWidth: "500px",
    margin: "0 20px",
    gap: "10px",
  },

  input: {
    flex: 1,
    padding: "10px 14px",
    borderRadius: "10px",
    border: "1px solid rgba(255,255,255,0.1)",
    background: "#1e293b",
    color: "white",
    outline: "none",
  },

  searchBtn: {
    padding: "10px 14px",
    borderRadius: "10px",
    border: "none",
    background: "#2563eb",
    color: "white",
    cursor: "pointer",
  },

  right: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },

  link: {
    color: "white",
    textDecoration: "none",
    padding: "8px 12px",
    borderRadius: "8px",
    background: "#1e293b",
  },

  signInBtn: {
    padding: "8px 14px",
    borderRadius: "8px",
    border: "none",
    background: "#f59e0b",
    color: "white",
    cursor: "pointer",
  },
};
