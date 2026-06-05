"""
Backend FastAPI - Cloud Demo
Déployé sur OpenShift, connecté à PostgreSQL
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import psycopg2
import psycopg2.extras
import os
from datetime import datetime

app = FastAPI(
    title="CloudDemo API",
    description="API FastAPI connectée à PostgreSQL sur OpenShift",
    version="1.0.0"
)

# ─── CORS : autoriser Vercel + localhost ─────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Connexion PostgreSQL ─────────────────────────────────────────────────────
def get_connection():
    """
    Connexion à la base PostgreSQL.
    Les variables d'environnement sont injectées par OpenShift (Secret ou ConfigMap).
    """
    return psycopg2.connect(
        host=os.getenv("POSTGRES_HOST", "localhost"),
        port=os.getenv("POSTGRES_PORT", "5432"),
        dbname=os.getenv("POSTGRES_DB", "clouddemo"),
        user=os.getenv("POSTGRES_USER", "postgres"),
        password=os.getenv("POSTGRES_PASSWORD", ""),
        cursor_factory=psycopg2.extras.RealDictCursor
    )

# ─── Création de la table au démarrage ───────────────────────────────────────
@app.on_event("startup")
def create_table():
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("""
        CREATE TABLE IF NOT EXISTS messages (
            id          SERIAL PRIMARY KEY,
            nom         VARCHAR(100) NOT NULL,
            email       VARCHAR(150) NOT NULL,
            message     TEXT NOT NULL,
            created_at  TIMESTAMP DEFAULT NOW()
        )
    """)
    conn.commit()
    cur.close()
    conn.close()

# ─── Modèles Pydantic ─────────────────────────────────────────────────────────
class MessageCreate(BaseModel):
    nom: str
    email: str
    message: str

class MessageOut(BaseModel):
    id: int
    nom: str
    email: str
    message: str
    created_at: Optional[datetime]

# ─── Routes ──────────────────────────────────────────────────────────────────
@app.get("/", summary="Health check")
def root():
    return {
        "status": "ok",
        "service": "CloudDemo API",
        "platform": "OpenShift",
        "database": "PostgreSQL"
    }

@app.get("/health", summary="Health check pour OpenShift")
def health():
    """OpenShift Liveness/Readiness Probe"""
    try:
        conn = get_connection()
        conn.close()
        return {"status": "healthy", "db": "connected"}
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"DB error: {str(e)}")

@app.get("/messages", response_model=list[MessageOut], summary="Lister tous les messages")
def get_messages():
    """Récupère tous les messages depuis PostgreSQL"""
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM messages ORDER BY created_at DESC")
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return [dict(row) for row in rows]

@app.post("/messages", response_model=MessageOut, status_code=201, summary="Créer un message")
def create_message(payload: MessageCreate):
    """Insère un nouveau message dans PostgreSQL"""
    conn = get_connection()
    cur = conn.cursor()
    cur.execute(
        "INSERT INTO messages (nom, email, message) VALUES (%s, %s, %s) RETURNING *",
        (payload.nom, payload.email, payload.message)
    )
    new_row = dict(cur.fetchone())
    conn.commit()
    cur.close()
    conn.close()
    return new_row

@app.delete("/messages/{message_id}", summary="Supprimer un message")
def delete_message(message_id: int):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("DELETE FROM messages WHERE id = %s RETURNING id", (message_id,))
    deleted = cur.fetchone()
    conn.commit()
    cur.close()
    conn.close()
    if not deleted:
        raise HTTPException(status_code=404, detail="Message non trouvé")
    return {"deleted": message_id}
