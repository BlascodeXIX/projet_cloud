import { useState } from "react";

export default function FormPage({ apiUrl, onSuccess }) {
  const [form, setForm] = useState({ nom: "", email: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!form.nom || !form.email || !form.message) {
      setError("Tous les champs sont obligatoires.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${apiUrl}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Erreur serveur");
      const data = await res.json();
      onSuccess(data);
    } catch (e) {
      setError("Impossible de contacter le serveur. Vérifiez que le backend tourne.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "calc(100vh - 60px)", padding: "2rem" }}>
      <div style={{ width: "100%", maxWidth: 480 }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📝</div>
          <h1 style={{ color: "#f1f5f9", fontSize: 28, fontWeight: 700, margin: 0 }}>Nouveau message</h1>
          <p style={{ color: "#64748b", marginTop: 8, fontSize: 14 }}>Sera stocké dans PostgreSQL sur OpenShift</p>
        </div>

        {/* Card */}
        <div style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 16,
          padding: "2rem",
        }}>
          {["nom", "email", "message"].map(field => (
            <div key={field} style={{ marginBottom: "1.2rem" }}>
              <label style={{ color: "#94a3b8", fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>
                {field === "nom" ? "Nom complet" : field === "email" ? "Adresse email" : "Message"}
              </label>
              {field === "message" ? (
                <textarea
                  rows={4}
                  value={form.message}
                  onChange={e => setForm({ ...form, message: e.target.value })}
                  placeholder="Votre message..."
                  style={inputStyle}
                />
              ) : (
                <input
                  type={field === "email" ? "email" : "text"}
                  value={form[field]}
                  onChange={e => setForm({ ...form, [field]: e.target.value })}
                  placeholder={field === "nom" ? "Jean Dupont" : "jean@exemple.com"}
                  style={inputStyle}
                />
              )}
            </div>
          ))}

          {error && (
            <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 8, padding: "10px 14px", color: "#f87171", fontSize: 13, marginBottom: "1rem" }}>
              ⚠️ {error}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              width: "100%",
              padding: "12px",
              background: loading ? "#374151" : "linear-gradient(135deg, #6366f1, #8b5cf6)",
              color: "#fff",
              border: "none",
              borderRadius: 10,
              fontSize: 15,
              fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer",
              transition: "all 0.2s",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            {loading ? "⏳ Envoi en cours..." : "Envoyer → Voir les données"}
          </button>
        </div>

        {/* Architecture badge */}
        <div style={{ display: "flex", justifyContent: "center", gap: 12, marginTop: "1.5rem" }}>
          {[["▲", "Vercel", "#000"], ["→", "FastAPI", "#059669"], ["🐘", "PostgreSQL", "#1d4ed8"]].map(([icon, label, color]) => (
            <div key={label} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: "4px 12px", fontSize: 12, color: "#94a3b8", display: "flex", alignItems: "center", gap: 4 }}>
              <span>{icon}</span><span>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const inputStyle = {
  display: "block",
  width: "100%",
  marginTop: 6,
  padding: "10px 14px",
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 8,
  color: "#f1f5f9",
  fontSize: 14,
  outline: "none",
  boxSizing: "border-box",
  resize: "vertical",
  fontFamily: "inherit",
};
