"use client";

import { useEffect, useState } from "react";

export default function AdminPage() {
  const [tab, setTab] = useState<"pending" | "issued">("pending");
  const [pending, setPending] = useState<any[]>([]);
  const [issued, setIssued] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const p = await fetch("/api/admin/requests/pending");
    const i = await fetch("/api/admin/requests/issued");

    const pData = await p.json();
    const iData = await i.json();

    setPending(pData.requests || []);
    setIssued(iData.requests || []);
  };

  const action = async (id: string, type: string) => {
    await fetch("/api/admin/approve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requestId: id, action: type }),
    });

    fetchData();
  };

  const containerStyle: React.CSSProperties = {
    display: "flex",
    minHeight: "100vh",
    background: "#f4f6f8",
    fontFamily: "system-ui",
  };

  const sidebarStyle: React.CSSProperties = {
    width: "240px",
    background: "#111827",
    color: "white",
    padding: "20px",
  };

  const contentStyle: React.CSSProperties = {
    flex: 1,
    padding: "24px",
  };

  const cardStyle: React.CSSProperties = {
    background: "white",
    borderRadius: "12px",
    padding: "16px",
    marginBottom: "12px",
    border: "1px solid #e5e7eb",
  };

  const buttonStyle = (color: string): React.CSSProperties => ({
    padding: "8px 12px",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    background: color,
    color: "white",
    marginTop: "10px",
  });

  const list = tab === "pending" ? pending : issued;

  return (
    <div style={containerStyle}>
      {/* SIDEBAR */}
      <div style={sidebarStyle}>
        <h2 style={{ marginBottom: "20px" }}>📚 Admin</h2>

        <div
          onClick={() => setTab("pending")}
          style={{
            padding: "10px",
            cursor: "pointer",
            background: tab === "pending" ? "#2563eb" : "transparent",
            borderRadius: "8px",
            marginBottom: "10px",
          }}
        >
          📌 Pending
        </div>

        <div
          onClick={() => setTab("issued")}
          style={{
            padding: "10px",
            cursor: "pointer",
            background: tab === "issued" ? "#2563eb" : "transparent",
            borderRadius: "8px",
          }}
        >
          📚 Issued
        </div>
      </div>

      {/* MAIN */}
      <div style={contentStyle}>
        <h1 style={{ fontSize: "24px", marginBottom: "20px" }}>
          {tab === "pending" ? "Pending Requests" : "Issued Books"}
        </h1>

        {list.length === 0 && <p>No data found</p>}

        {list.map((r) => (
          <div key={r._id} style={cardStyle}>
            <h3 style={{ marginBottom: "6px" }}>{r.bookId?.title}</h3>

            <p style={{ margin: 0, color: "#666" }}>User: {r.userId}</p>

            <p style={{ marginTop: "6px" }}>
              Status: <b>{r.status}</b>
            </p>

            {tab === "pending" && (
              <button
                style={buttonStyle("#2563eb")}
                onClick={() => action(r._id, "issue")}
              >
                Approve Borrow
              </button>
            )}

            {tab === "issued" && (
              <button
                style={buttonStyle("#16a34a")}
                onClick={() => action(r._id, "return")}
              >
                Mark Returned
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
