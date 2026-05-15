"use client";

import { useEffect, useState } from "react";

export default function AdminPage() {
  const [requests, setRequests] = useState<any[]>([]);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    const res = await fetch("/api/admin/requests");
    const data = await res.json();

    if (data.success) {
      setRequests(data.requests);
    }
  };

  const approveRequest = async (requestId: string) => {
    const res = await fetch("/api/admin/approve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requestId }),
    });

    const data = await res.json();
    alert(data.message);

    fetchRequests(); // refresh list
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>🛠 Admin Dashboard</h1>

      <h2>📌 Pending Requests</h2>

      {requests.length === 0 && <p>No requests found</p>}

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
            <b>User:</b> {req.userId}
          </p>
          <p>
            <b>Status:</b> {req.status}
          </p>

          <button onClick={() => approveRequest(req._id)}>Approve</button>
        </div>
      ))}
    </div>
  );
}
