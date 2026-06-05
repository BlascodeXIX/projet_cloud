import { useState, useEffect } from "react";

export default function DisplayPage({ apiUrl, lastAdded, onBack }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMessages = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${apiUrl}/messages`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        setMessages(data);
      } catch {
        setError("Impossible de charger les données. Vérifiez le backend.");
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
  }, [apiUrl]);

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "2rem 1rem" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: "2rem" }}>
        <button
          onClick={onBack}
          style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#94a3b8", borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontSize: 13 }}
        >
          ← Retour
        </button>
        <div>
          <h1 style={{ color: "#f1f5f9", fontSize: 24, fontWeight: 700, margin: 0 }}>Données PostgreSQL</h1>
          <p style={{ color: "#64748b", margin: "4px 0 0", fontSize: 13 }}>Lues depuis la base de données sur OpenShift</p>
        </div>
        <div style={{ marginLeft: "auto", background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)", borderRadius: 8, padding: "6px 14px", color: "#818cf8", fontSize: 13, fontWeight: 600 }}>
          {messages.length} entrée{messages.length > 1 ? "s" : ""}
        </div>
      </div>

      {/* Architecture flow */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0, marginBottom: "2rem", background: "rgba(255,255,255,0.03)", borderRadius: 12, padding: "14px", border: "1px solid rgba(255,255,255,0.06)" }}>
        {[
          { icon: "🌐", label: "Browser", sub: "Vercel CDN" },
          { arrow: true },
          { icon: "⚡", label: "FastAPI", sub: "OpenShift Pod" },
          { arrow: true },
          { icon: "🐘", label: "PostgreSQL", sub: "OpenShift DB" },
        ].map((item, i) =>
          item.arrow ? (
            <div key={i} style={{ color: "#6366f1", fontSize: 18, margin: "0 8px" }}>→</div>
          ) : (
            <div key={i} style={{ textAlign: "center", padding: "0 12px" }}>
              <div style={{ fontSize: 24 }}>{item.icon}</div>
              <div style={{ color: "#f1f5f9", fontSize: 12, fontWeight: 700 }}>{item.label}</div>
              <div style={{ color: "#64748b", fontSize: 10 }}>{item.sub}</div>
            </div>
          )
        )}
      </div>

      {/* Content */}
      {loading && (
        <div style={{ textAlign: "center", color: "#64748b", padding: "3rem" }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>⏳</div>
          Chargement depuis PostgreSQL...
        </div>
      )}

      {error && (
        <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 12, padding: "1.5rem", color: "#f87171", textAlign: "center" }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>⚠️</div>
          {error}
        </div>
      )}

      {!loading && !error && messages.length === 0 && (
        <div style={{ textAlign: "center", color: "#64748b", padding: "3rem" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
          Aucun message. <span style={{ color: "#6366f1", cursor: "pointer" }} onClick={onBack}>Ajoutez-en un !</span>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {messages.map((msg, i) => (
          <div
            key={msg.id || i}
            style={{
              background: lastAdded?.id === msg.id ? "rgba(99,102,241,0.1)" : "rgba(255,255,255,0.04)",
              border: "1px solid " + (lastAdded?.id === msg.id ? "rgba(99,102,241,0.4)" : "rgba(255,255,255,0.08)"),
              borderRadius: 12,
              padding: "1.2rem 1.5rem",
              display: "grid",
              gridTemplateColumns: "1fr auto",
              gap: 8,
              alignItems: "start",
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                <div style={{ width: 32, height: 32, background: "linear-gradient(135deg, #6366f1, #8b5cf6)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 13, fontWeight: 700 }}>
                  {msg.nom?.[0]?.toUpperCase() || "?"}
                </div>
                <div>
                  <div style={{ color: "#f1f5f9", fontWeight: 700, fontSize: 14 }}>{msg.nom}</div>
                  <div style={{ color: "#64748b", fontSize: 12 }}>{msg.email}</div>
                </div>
                {lastAdded?.id === msg.id && (
                  <span style={{ background: "rgba(99,102,241,0.2)", color: "#818cf8", fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20, marginLeft: 4 }}>NOUVEAU</span>
                )}
              </div>
              <p style={{ color: "#94a3b8", fontSize: 13, margin: 0, lineHeight: 1.6 }}>{msg.message}</p>
            </div>
            <div style={{ color: "#475569", fontSize: 11, textAlign: "right", whiteSpace: "nowrap" }}>
              #{msg.id}<br />
              {msg.created_at ? new Date(msg.created_at).toLocaleDateString("fr-FR") : ""}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
