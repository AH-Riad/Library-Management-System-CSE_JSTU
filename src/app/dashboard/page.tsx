"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";

export default function Dashboard() {
  const { user } = useUser();
  const [books, setBooks] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch("/api/user/books");
      const data = await res.json();

      if (data.success) {
        setBooks(data.records);
      }
    };

    fetchData();
  }, []);

  const pending = books.filter((b) => b.status === "pending");
  const issued = books.filter((b) => b.status === "issued");
  const returned = books.filter((b) => b.status === "returned");

  return (
    <div style={{ padding: "20px" }}>
      <h1>Welcome, {user?.firstName}</h1>

      <h2>📌 Pending Requests</h2>
      {pending.map((b, i) => (
        <p key={i}>{b.bookId?.title}</p>
      ))}

      <h2>📚 Issued Books</h2>
      {issued.map((b, i) => (
        <p key={i}>
          {b.bookId?.title} - Due: {new Date(b.dueDate).toDateString()}
        </p>
      ))}

      <h2>✅ Returned Books</h2>
      {returned.map((b, i) => (
        <p key={i}>
          {b.bookId?.title} - Fine: {b.fine} TK
        </p>
      ))}
    </div>
  );
}
