"use client";

import { useEffect, useState } from "react";

export default function AdminPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);

      // ✅ FIXED ENDPOINT
      const res = await fetch("/api/admin/requests/pending");
      const data = await res.json();

      console.log("ADMIN RESPONSE:", data);

      setRequests(data.requests || []);
    } catch (error) {
      console.log("FETCH ERROR:", error);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const approveRequest = async (requestId: string) => {
    try {
      const res = await fetch("/api/admin/approve", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ requestId }),
      });

      const data = await res.json();

      alert(data.message || "Updated");

      // refresh list after approval
      fetchRequests();
    } catch (error) {
      alert("Something went wrong");
      console.log(error);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>🛠 Admin Dashboard</h1>

      <h2>📌 Pending Requests</h2>

      {loading && <p>Loading...</p>}

      {!loading && requests.length === 0 && <p>No requests found</p>}

      {requests.map((req) => (
        <div
          key={req._id}
          style={{
            border: "1px solid #ccc",
            padding: "10px",
            marginBottom: "10px",
          }}
        >
          <p>
            <b>Book:</b> {req.bookId?.title}
          </p>

          <p>
            <b>Author:</b> {req.bookId?.author}
          </p>

          <p>
            <b>User ID:</b> {req.userId}
          </p>

          <p>
            <b>Status:</b> {req.status}
          </p>

          <button
            onClick={() => approveRequest(req._id)}
            style={{
              padding: "5px 10px",
              cursor: "pointer",
            }}
          >
            Approve
          </button>
        </div>
      ))}
    </div>
  );
}
