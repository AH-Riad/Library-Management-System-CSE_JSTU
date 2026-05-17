import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "react-hot-toast";
import Navbar from "@/components/Navbar";

import { startCronJobs } from "@/lib/cron";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CSE Library System",
  description: "University Library Management System",
};

// ✅ Prevent multiple cron starts in Next.js dev hot reload
let cronStarted = false;
function initCron() {
  if (cronStarted) return;
  cronStarted = true;
  startCronJobs();
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  initCron();

  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
          style={{
            margin: 0,
            padding: 0,
            minHeight: "100vh",
            position: "relative",
            overflowX: "hidden",
          }}
        >
          {/* 🔥 BACKGROUND LOGO WATERMARK */}
          <div
            style={{
              position: "fixed",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              pointerEvents: "none",
              zIndex: 0,
            }}
          >
            <img
              src="/logo.webp"
              alt="background logo"
              style={{
                width: "520px",
                height: "auto",
                objectFit: "contain",
                opacity: 0.22,
                filter: "contrast(1.15) saturate(1.1) brightness(1)",
                transform: "scale(1.05)",
              }}
            />
          </div>

          {/* PAGE CONTENT */}
          <div style={{ position: "relative", zIndex: 1 }}>
            <Toaster position="top-center" />
            <Navbar />
            {children}
          </div>
        </body>
      </html>
    </ClerkProvider>
  );
}
