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
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const q = searchParams.get("search") || "";
    setQuery(q);
    setMenuOpen(false);
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const trimmed = query.trim();

    setMenuOpen(false);

    if (!trimmed) {
      router.push("/");
      return;
    }

    router.push(`/?search=${encodeURIComponent(trimmed)}`);
  };

  return (
    <>
      <nav className="cse-lib-navbar" style={styles.nav}>
        <Link
          href="/"
          style={styles.left}
          className="cse-lib-brand"
          onClick={() => setMenuOpen(false)}
        >
          <div className="cse-lib-logo-wrapper" style={styles.logoWrapper}>
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

        <form
          onSubmit={handleSearch}
          style={styles.searchBox}
          className="cse-lib-search"
        >
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search books..."
            aria-label="Search books"
            style={styles.input}
          />

          <button type="submit" style={styles.searchBtn}>
            Search
          </button>
        </form>

        <button
          type="button"
          className="cse-lib-menu-toggle"
          aria-label={
            menuOpen ? "Close navigation menu" : "Open navigation menu"
          }
          aria-expanded={menuOpen}
          aria-controls="cse-lib-nav-links"
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? (
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          ) : (
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="M4 6h16" />
              <path d="M4 12h16" />
              <path d="M4 18h16" />
            </svg>
          )}
        </button>

        <div
          id="cse-lib-nav-links"
          className={`cse-lib-nav-links${menuOpen ? " cse-lib-open" : ""}`}
          style={styles.right}
        >
          <Link style={styles.link} onClick={() => setMenuOpen(false)} href="/">
            Home
          </Link>

          <Link
            style={styles.link}
            onClick={() => setMenuOpen(false)}
            href="/profile"
          >
            Profile
          </Link>

          <Link
            style={styles.link}
            onClick={() => setMenuOpen(false)}
            href="/admin"
          >
            Admin
          </Link>

          <SignedOut>
            <SignInButton mode="modal">
              <button
                className="cse-lib-sign-in-button"
                style={styles.signInBtn}
                onClick={() => setMenuOpen(false)}
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

      {/* Only the layout changes on mobile. Original desktop styles remain intact. */}
      <style jsx global>{`
        .cse-lib-menu-toggle {
          display: none;
        }

        @media (max-width: 900px) {
          .cse-lib-navbar {
            flex-wrap: wrap !important;
            gap: 12px;
            padding: 12px 16px !important;
          }

          .cse-lib-brand {
            min-width: 0 !important;
            flex: 1 1 auto;
          }

          .cse-lib-search {
            order: 3;
            flex: 1 1 100% !important;
            width: 100%;
            max-width: none !important;
            min-width: 0;
            margin: 0 !important;
            box-sizing: border-box;
          }

          .cse-lib-search input {
            min-width: 0;
            box-sizing: border-box;
            font-size: 16px;
          }

          .cse-lib-search button {
            flex-shrink: 0;
          }

          .cse-lib-menu-toggle {
            order: 2;
            display: flex;
            align-items: center;
            justify-content: center;
            flex: 0 0 44px;
            width: 44px;
            height: 44px;
            padding: 0;
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 10px;
            background: #1e293b;
            color: white;
            cursor: pointer;
          }

          .cse-lib-nav-links {
            display: none !important;
            order: 4;
            flex: 1 1 100%;
            flex-direction: column;
            align-items: stretch !important;
            gap: 8px !important;
            width: 100%;
            min-width: 0;
            margin-top: 4px;
          }

          .cse-lib-nav-links.cse-lib-open {
            display: flex !important;
          }

          .cse-lib-nav-links a {
            box-sizing: border-box;
            width: 100%;
            padding: 12px !important;
            text-align: center;
          }

          .cse-lib-sign-in-button {
            box-sizing: border-box;
            width: 100%;
            padding: 12px !important;
          }

          .cse-lib-nav-links > :last-child {
            align-self: center;
          }
        }
      `}</style>
    </>
  );
}

export default function Navbar() {
  return (
    <Suspense fallback={null}>
      <NavbarContent />
    </Suspense>
  );
}

/* STYLES: preserved from the original Navbar.tsx */
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
