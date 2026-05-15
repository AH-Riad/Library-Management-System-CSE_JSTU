"use client";

import { useEffect, useState } from "react";

export default function AdminPage() {
  const [pending, setPending] = useState<any[]>([]);
  const [issued, setIssued] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      const [pendingRes, issuedRes] = await Promise.all([
        fetch("/api/admin/requests/pending"),
        fetch("/api/admin/requests/return"),
      ]);

      const pendingData = await pendingRes.json();
      const issuedData = await issuedRes.json();

      setPending(pendingData.requests || []);
      setIssued(issuedData.requests || []);
    } catch (err) {
      console.log(err);
      setPending([]);
      setIssued([]);
    } finally {
      setLoading(false);
    }
  };

  const approveBorrow = async (requestId: string) => {
    try {
      await fetch("/api/admin/approve", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ requestId }),
      });

      fetchData();
    } catch (err) {
      console.log(err);
    }
  };

  const markReturned = async (requestId: string) => {
    try {
      await fetch("/api/admin/requests/approve-return", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ requestId }),
      });

      fetchData();
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h1>🛠 Admin Dashboard</h1>

      {loading && <p>Loading...</p>}

      {/* PENDING */}
      <h2>📌 Pending Requests</h2>

      {pending.length === 0 && <p>No pending requests</p>}

      {pending.map((item) => (
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
            <b>User:</b> {item.userId}
          </p>
          <p>
            <b>Status:</b> {item.status}
          </p>

          <button onClick={() => approveBorrow(item._id)}>
            Approve Borrow
          </button>
        </div>
      ))}

      {/* ISSUED */}
      <h2 style={{ marginTop: "30px" }}>📚 Issued Books</h2>

      {issued.length === 0 && <p>No issued books</p>}

      {issued.map((item) => (
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
            <b>User:</b> {item.userId}
          </p>
          <p>
            <b>Status:</b> {item.status}
          </p>

          {item.status === "issued" && (
            <button onClick={() => markReturned(item._id)}>
              Mark Returned
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
