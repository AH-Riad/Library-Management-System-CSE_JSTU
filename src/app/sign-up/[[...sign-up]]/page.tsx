"use client";

import { SignedIn, SignedOut, SignInButton, useUser } from "@clerk/nextjs";

import React, { useEffect, useState } from "react";

const Homepage = () => {
  const { user } = useUser();

  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBooks = async () => {
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
    try {
      const res = await fetch("/api/borrow/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          userId: user?.id,
          bookId,
        }),
      });

      const data = await res.json();

      alert(data.message || "Request sent");
    } catch (err) {
      console.log(err);
      alert("Something went wrong");
    }
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(to bottom right, #eff6ff, #ffffff, #f5f3ff)",
      }}
    >
      {/* HERO SECTION */}
      <section
        style={{
          padding: "80px 20px 60px",
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "40px",
            alignItems: "center",
          }}
        >
          {/* LEFT */}
          <div>
            <div
              style={{
                display: "inline-block",
                background: "#dbeafe",
                color: "#2563eb",
                padding: "8px 14px",
                borderRadius: "999px",
                fontWeight: "600",
                marginBottom: "20px",
              }}
            >
              📚 Smart Digital Library
            </div>

            <h1
              style={{
                fontSize: "60px",
                lineHeight: "1.1",
                marginBottom: "20px",
                color: "#0f172a",
                fontWeight: "800",
              }}
            >
              Modern CSE <br /> Library System
            </h1>

            <p
              style={{
                fontSize: "18px",
                color: "#475569",
                lineHeight: "1.7",
                marginBottom: "30px",
                maxWidth: "560px",
              }}
            >
              Borrow books, manage returns, track issued books, and experience a
              fully digital university library management platform built for
              students.
            </p>

            <div
              style={{
                display: "flex",
                gap: "16px",
                flexWrap: "wrap",
              }}
            >
              <SignedOut>
                <SignInButton mode="modal">
                  <button
                    style={{
                      padding: "14px 24px",
                      borderRadius: "12px",
                      border: "none",
                      background: "linear-gradient(to right, #2563eb, #7c3aed)",
                      color: "white",
                      fontSize: "16px",
                      fontWeight: "bold",
                      cursor: "pointer",
                      boxShadow: "0 10px 25px rgba(37,99,235,0.3)",
                    }}
                  >
                    Get Started
                  </button>
                </SignInButton>
              </SignedOut>

              <SignedIn>
                <div
                  style={{
                    padding: "14px 22px",
                    borderRadius: "12px",
                    background: "white",
                    border: "1px solid #ddd",
                    fontWeight: "600",
                    color: "#111827",
                  }}
                >
                  Welcome back, {user?.firstName}
                </div>
              </SignedIn>

              <button
                style={{
                  padding: "14px 24px",
                  borderRadius: "12px",
                  border: "1px solid #cbd5e1",
                  background: "white",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                Explore Books
              </button>
            </div>
          </div>

          {/* RIGHT */}
          <div
            style={{
              background: "linear-gradient(135deg, #2563eb, #7c3aed)",
              borderRadius: "30px",
              padding: "40px",
              color: "white",
              boxShadow: "0 25px 50px rgba(0,0,0,0.15)",
            }}
          >
            <h2
              style={{
                fontSize: "32px",
                marginBottom: "25px",
                fontWeight: "700",
              }}
            >
              Library Statistics
            </h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "20px",
              }}
            >
              {[
                {
                  title: "Books",
                  value: books.length,
                },
                {
                  title: "Categories",
                  value: "12+",
                },
                {
                  title: "Students",
                  value: "500+",
                },
                {
                  title: "Available",
                  value: "24/7",
                },
              ].map((item, index) => (
                <div
                  key={index}
                  style={{
                    background: "rgba(255,255,255,0.12)",
                    padding: "24px",
                    borderRadius: "20px",
                    backdropFilter: "blur(8px)",
                  }}
                >
                  <h3
                    style={{
                      fontSize: "32px",
                      marginBottom: "10px",
                    }}
                  >
                    {item.value}
                  </h3>

                  <p
                    style={{
                      margin: 0,
                      opacity: 0.9,
                    }}
                  >
                    {item.title}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* BOOK SECTION */}
      <section
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "20px",
        }}
      >
        <div
          style={{
            marginBottom: "40px",
          }}
        >
          <h2
            style={{
              fontSize: "40px",
              marginBottom: "12px",
              color: "#0f172a",
            }}
          >
            Featured Books
          </h2>

          <p
            style={{
              color: "#64748b",
              fontSize: "17px",
            }}
          >
            Browse available books from the university library.
          </p>
        </div>

        {loading ? (
          <div
            style={{
              padding: "40px",
              textAlign: "center",
              fontSize: "18px",
            }}
          >
            Loading books...
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "24px",
            }}
          >
            {books.map((book) => (
              <div
                key={book._id}
                style={{
                  background: "white",
                  borderRadius: "24px",
                  padding: "24px",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
                  transition: "0.3s",
                  border: "1px solid #f1f5f9",
                }}
              >
                <div
                  style={{
                    height: "180px",
                    borderRadius: "18px",
                    marginBottom: "20px",
                    background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "50px",
                  }}
                >
                  📘
                </div>

                <div>
                  <h3
                    style={{
                      fontSize: "24px",
                      marginBottom: "10px",
                      color: "#111827",
                    }}
                  >
                    {book.title}
                  </h3>

                  <p
                    style={{
                      color: "#475569",
                      marginBottom: "8px",
                    }}
                  >
                    ✍️ {book.author}
                  </p>

                  <p
                    style={{
                      color: "#64748b",
                      marginBottom: "20px",
                    }}
                  >
                    📂 {book.category}
                  </p>

                  <button
                    onClick={() => borrowBook(book._id)}
                    style={{
                      width: "100%",
                      padding: "12px",
                      borderRadius: "12px",
                      border: "none",
                      background: "linear-gradient(to right, #2563eb, #7c3aed)",
                      color: "white",
                      fontWeight: "bold",
                      fontSize: "15px",
                      cursor: "pointer",
                    }}
                  >
                    Borrow Book
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* FOOTER */}
      <footer
        style={{
          marginTop: "100px",
          padding: "40px 20px",
          textAlign: "center",
          color: "#64748b",
          borderTop: "1px solid #e2e8f0",
          background: "white",
        }}
      >
        <h3
          style={{
            marginBottom: "10px",
            color: "#111827",
          }}
        >
          CSE Library Management System
        </h3>

        <p>
          Built with Next.js, MongoDB, Clerk Authentication & modern UI design.
        </p>
      </footer>
    </main>
  );
};

export default Homepage;
