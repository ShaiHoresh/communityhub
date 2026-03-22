"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <html lang="he" dir="rtl">
      <body style={{ fontFamily: "system-ui, sans-serif", background: "#f3f4f6", color: "#111827" }}>
        <div style={{ display: "flex", minHeight: "100vh", alignItems: "center", justifyContent: "center", padding: "1.5rem" }}>
          <div style={{ maxWidth: "28rem", textAlign: "center", background: "#fff", borderRadius: "1rem", padding: "2.5rem", boxShadow: "0 1px 3px rgba(0,0,0,.1)" }}>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "1rem" }}>
              שגיאה קריטית
            </h2>
            <p style={{ fontSize: "0.875rem", lineHeight: 1.6, color: "#6b7280", marginBottom: "1.5rem" }}>
              אירעה שגיאה בלתי צפויה. נסו לרענן את הדף.
            </p>
            <button
              onClick={reset}
              style={{ background: "#111827", color: "#fff", border: "none", borderRadius: "9999px", padding: "0.625rem 1.25rem", fontSize: "0.875rem", fontWeight: 500, cursor: "pointer" }}
            >
              רענן
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
