"use client";

export function PrintButton() {
  return (
    <div className="no-print" style={{ textAlign: "center", paddingBottom: 16 }}>
      <button
        onClick={() => window.print()}
        style={{
          fontFamily: "var(--font-cormorant)",
          fontSize: 14,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          background: "#1a3a2a",
          color: "#fff",
          border: "none",
          padding: "12px 32px",
          cursor: "pointer",
          borderRadius: 2,
        }}
      >
        ↓ &nbsp;Imprimer / Exporter PDF
      </button>
    </div>
  );
}
