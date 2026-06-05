import { useState } from "react";
import FormPage from "./FormPage";
import DisplayPage from "./DisplayPage";

export default function App() {
  const [page, setPage] = useState("form");
  const [lastAdded, setLastAdded] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

  return (
    <div style={{ minHeight: "100vh", background: "#0f172a", fontFamily: "'Segoe UI', sans-serif" }}>
      {/* Navbar */}
      <nav style={{
        background: "rgba(255,255,255,0.05)",
        backdropFilter: "blur(10px)",
        borderBottom: "1px solid rgba(255,255,255,0.1)",
        padding: "0 2rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        height: "60px"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: 32, height: 32, background: "linear-gradient(135deg, #6366f1, #8b5cf6)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>☁️</div>
          <span style={{ color: "#fff", fontWeight: 700, fontSize: 16 }}>CloudDemo</span>
          <span style={{ color: "#6366f1", fontSize: 11, background: "rgba(99,102,241,0.15)", padding: "2px 8px", borderRadius: 20, fontWeight: 600 }}>VERCEL + OPENSHIFT</span>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          {["form", "display"].map(p => (
            <button
              key={p}
              onClick={() => setPage(p)}
              style={{
                background: page === p ? "linear-gradient(135deg, #6366f1, #8b5cf6)" : "transparent",
                color: page === p ? "#fff" : "#94a3b8",
                border: "1px solid " + (page === p ? "transparent" : "rgba(255,255,255,0.1)"),
                borderRadius: 8,
                padding: "6px 16px",
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 600,
                transition: "all 0.2s"
              }}
            >
              {p === "form" ? "📝 Ajouter" : "📊 Voir les données"}
            </button>
          ))}
        </div>
      </nav>

      {page === "form"
        ? <FormPage apiUrl={API_URL} onSuccess={(item) => { setLastAdded(item); setPage("display"); }} />
        : <DisplayPage apiUrl={API_URL} lastAdded={lastAdded} onBack={() => setPage("form")} />
      }
    </div>
  );
}
