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

      const userId = "user_373IwGkB4avKnerIOwo7klUrEK7";

      const res = await fetch(`/api/user/books?userId=${userId}`);
      const data = await res.json();

      // ✅ FIX IS HERE
      setRecords(data.books || []);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const requestReturn = async (requestId: string) => {
    try {
      const res = await fetch("/api/return/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ requestId }),
      });

      const data = await res.json();

      alert(data.message || "Request sent");

      fetchBooks();
    } catch (err) {
      console.log(err);
      alert("Something went wrong");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>📚 My Books</h1>

      {loading && <p>Loading...</p>}

      {!loading && records.length === 0 && <p>No books found</p>}

      {records.map((record) => (
        <div
          key={record._id}
          style={{
            border: "1px solid #ddd",
            padding: "12px",
            marginBottom: "10px",
            borderRadius: "8px",
          }}
        >
          <p>
            <b>Book:</b> {record.bookId?.title}
          </p>
          <p>
            <b>Author:</b> {record.bookId?.author}
          </p>
          <p>
            <b>Status:</b> {record.status}
          </p>

          {record.dueDate && (
            <p>
              <b>Due Date:</b> {new Date(record.dueDate).toLocaleDateString()}
            </p>
          )}

          {/* ONLY ISSUED */}
          {record.status === "issued" && (
            <button
              onClick={() => requestReturn(record._id)}
              style={{
                padding: "6px 12px",
                marginTop: "8px",
                cursor: "pointer",
                background: "#2563eb",
                color: "white",
                border: "none",
                borderRadius: "6px",
              }}
            >
              Request Return
            </button>
          )}

          {record.status === "return_pending" && (
            <p style={{ color: "orange" }}>
              ⏳ Return request pending admin approval
            </p>
          )}

          {record.status === "returned" && (
            <p style={{ color: "green" }}>✅ Book returned successfully</p>
          )}
        </div>
      ))}
    </div>
  );
}
