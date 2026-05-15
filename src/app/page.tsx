"use client";

import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignOutButton,
  useUser,
} from "@clerk/nextjs";
import React, { useEffect, useState } from "react";

const Homepage = () => {
  const { user } = useUser();
  const [books, setBooks] = useState<any[]>([]);

  useEffect(() => {
    const fetchBooks = async () => {
      const res = await fetch("/api/books");
      const data = await res.json();

      if (data.success) {
        setBooks(data.books);
      }
    };

    fetchBooks();
  }, []);

  const borrowBook = async (bookId: string) => {
    const res = await fetch("/api/borrow/request", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ bookId }),
    });

    const data = await res.json();
    alert(data.message || "Request sent");
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>📚 JSTU Library System</h1>

      <SignedOut>
        <SignInButton />
      </SignedOut>

      <SignedIn>
        <p>Welcome, {user?.firstName}</p>
        <SignOutButton />

        <hr />

        <h2>Available Books</h2>

        {books.map((book) => (
          <div
            key={book._id}
            style={{
              border: "1px solid #ccc",
              padding: "10px",
              marginBottom: "10px",
            }}
          >
            <h3>{book.title}</h3>
            <p>{book.author}</p>
            <p>{book.category}</p>

            <button onClick={() => borrowBook(book._id)}>Borrow</button>
          </div>
        ))}
      </SignedIn>
    </div>
  );
};

export default Homepage;
