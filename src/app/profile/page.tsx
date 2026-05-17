"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";

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

      setRecords(data.books || []);
    } catch (err) {
      console.log(err);
      toast.error("Failed to load books");
    } finally {
      setLoading(false);
    }
  };

  const requestReturn = async (requestId: string) => {
    try {
      const res = await fetch("/api/return/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId }),
      });

      const data = await res.json();

      if (data?.success) {
        toast.success(data.message || "Return request sent");
      } else {
        toast.error(data?.message || "Failed to send request");
      }

      fetchBooks();
    } catch (err) {
      console.log(err);
      toast.error("Something went wrong");
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "1100px", margin: "0 auto" }}>
      <h1 style={{ marginBottom: "16px", color: "#0f172a" }}>📚 My Books</h1>

      {loading && <p>Loading...</p>}
      {!loading && records.length === 0 && <p>No books found</p>}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: "16px",
        }}
      >
        {records.map((record) => (
          <div
            key={record._id}
            style={{
              padding: "14px",
              borderRadius: "16px",
              background: "white",
              boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
              border: "1px solid #e5e7eb",
              color: "#0f172a",
            }}
          >
            {/* ✅ FIXED IMAGE (NO CROPPING LIKE HOME PAGE) */}
            {record.bookId?.image && (
              <div
                style={{
                  width: "100%",
                  height: "180px",
                  background: "#f3f4f6",
                  borderRadius: "12px",
                  overflow: "hidden",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "10px",
                }}
              >
                <img
                  src={record.bookId.image}
                  alt={record.bookId?.title}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain", // ✅ SAME AS HOME PAGE (FIXED)
                  }}
                />
              </div>
            )}

            <p>
              <b>Book:</b> {record.bookId?.title}
            </p>

            <p>
              <b>Author:</b> {record.bookId?.author}
            </p>

            <p>
              <b>Status:</b> {record.status}
            </p>

            {record.fine > 0 && (
              <p style={{ color: "#dc2626", fontWeight: 700 }}>
                💰 Fine: {record.fine} TK
              </p>
            )}

            {record.daysLate > 0 && (
              <p style={{ color: "#d97706" }}>
                ⏱ Late by {record.daysLate} days
              </p>
            )}

            {record.isOverdue && (
              <p style={{ color: "#ef4444", fontWeight: 700 }}>⚠️ Overdue</p>
            )}

            {record.dueDate && (
              <p>
                <b>Due:</b> {new Date(record.dueDate).toLocaleDateString()}
              </p>
            )}

            {record.status === "issued" && (
              <button
                onClick={() => requestReturn(record._id)}
                style={{
                  marginTop: "10px",
                  padding: "10px",
                  width: "100%",
                  borderRadius: "10px",
                  border: "none",
                  cursor: "pointer",
                  fontWeight: 600,
                  background: record.fine > 0 ? "#ef4444" : "#2563eb",
                  color: "white",
                }}
              >
                {record.fine > 0
                  ? `💰 Pay Fine & Return (${record.fine} TK)`
                  : "Request Return"}
              </button>
            )}

            {record.status === "return_pending" && (
              <p style={{ color: "#f59e0b", marginTop: "8px" }}>
                ⏳ Return pending
              </p>
            )}

            {record.status === "returned" && (
              <p style={{ color: "#22c55e", marginTop: "8px" }}>✅ Returned</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
