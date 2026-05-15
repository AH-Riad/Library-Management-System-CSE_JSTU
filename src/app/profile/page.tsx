"use client";

import { useEffect, useState } from "react";

export default function ProfilePage() {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      setLoading(true);

      const res = await fetch("/api/user/books");
      const data = await res.json();

      setRecords(data.records || []);
    } catch (err) {
      console.log(err);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h1>📚 My Books</h1>

      {loading && <p>Loading...</p>}

      {!loading && records.length === 0 && <p>No books found</p>}

      {records.map((item) => (
        <div
          key={item._id}
          style={{
            border: "1px solid #ccc",
            padding: "10px",
            marginBottom: "10px",
          }}
        >
          <p>
            <b>Book:</b> {item.bookId?.title}
          </p>
          <p>
            <b>Author:</b> {item.bookId?.author}
          </p>

          <p>
            <b>Status:</b> {item.status}
          </p>

          {item.issueDate && (
            <p>
              <b>Issued:</b> {new Date(item.issueDate).toLocaleDateString()}
            </p>
          )}

          {item.dueDate && (
            <p>
              <b>Due Date:</b> {new Date(item.dueDate).toLocaleDateString()}
            </p>
          )}

          {item.status === "returned" && (
            <p style={{ color: "green" }}>✅ Book returned successfully</p>
          )}

          {item.status === "issued" && (
            <p style={{ color: "orange" }}>
              📌 Book is currently issued (return via admin)
            </p>
          )}

          {item.status === "pending" && (
            <p style={{ color: "blue" }}>⏳ Waiting for admin approval</p>
          )}
        </div>
      ))}
    </div>
  );
}
