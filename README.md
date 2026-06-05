# 🚀 CloudDemo — Guide de déploiement complet

Architecture : **React (Vercel)** ↔ **FastAPI + PostgreSQL (OpenShift)**

---

## 📁 Structure du projet

```
projet/
├── frontend/          ← React + Vite → déployé sur Vercel
│   ├── src/
│   │   ├── App.jsx
│   │   ├── FormPage.jsx
│   │   ├── DisplayPage.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── .env.example
│
└── backend/           ← FastAPI + PostgreSQL → déployé sur OpenShift
    ├── main.py
    ├── requirements.txt
    ├── Dockerfile
    ├── openshift-backend.yaml
    └── .env.example
```

---

## ÉTAPE 1 — Déployer le backend sur OpenShift

### 1.1 — Connectez-vous à OpenShift
```bash
oc login https://your-openshift-cluster.com --token=VOTRE_TOKEN
oc new-project clouddemo
```

### 1.2 — Déployer PostgreSQL (catalogue OpenShift)
```bash
# Depuis l'interface web : Catalog → PostgreSQL
# Ou en ligne de commande :
oc new-app postgresql-persistent \
  -p POSTGRESQL_USER=clouddemo_user \
  -p POSTGRESQL_PASSWORD=motdepassesecret \
  -p POSTGRESQL_DATABASE=clouddemo
```

### 1.3 — Builder l'image Docker du backend
```bash
cd backend/

# Option A : OpenShift Build (sans Docker local)
oc new-build --binary --name=clouddemo-backend
oc start-build clouddemo-backend --from-dir=. --follow

# Option B : Docker Hub
docker build -t VOTRE_DOCKERHUB/clouddemo-backend:latest .
docker push VOTRE_DOCKERHUB/clouddemo-backend:latest
```

### 1.4 — Appliquer les manifestes OpenShift
```bash
# Modifiez d'abord openshift-backend.yaml :
# - VOTRE_NAMESPACE
# - L'image Docker
# - L'URL Vercel (FRONTEND_URL)

oc apply -f openshift-backend.yaml
```

### 1.5 — Récupérer l'URL du backend
```bash
oc get route clouddemo-backend-route
# → clouddemo-backend-route-clouddemo.apps.openshift.example.com
```

### 1.6 — Tester le backend
```bash
curl https://VOTRE_URL_OPENSHIFT/health
# → {"status":"healthy","db":"connected"}

curl https://VOTRE_URL_OPENSHIFT/messages
# → []
```

---

## ÉTAPE 2 — Déployer le frontend sur Vercel

### 2.1 — Préparer le projet
```bash
cd frontend/
cp .env.example .env.local
# Editez .env.local :
# VITE_API_URL=https://VOTRE_URL_OPENSHIFT
```

### 2.2 — Tester en local
```bash
npm install
npm run dev
# → http://localhost:5173
```

### 2.3 — Déployer sur Vercel
```bash
# Option A : Interface Vercel.com
# 1. Allez sur vercel.com → New Project
# 2. Importez depuis GitHub (poussez le dossier frontend sur GitHub d'abord)
# 3. Settings → Environment Variables → VITE_API_URL = https://VOTRE_URL_OPENSHIFT
# 4. Cliquez Deploy

# Option B : CLI Vercel
npm install -g vercel
vercel login
vercel --prod
# → Répondez aux questions, ajoutez VITE_API_URL dans les env vars
```

### 2.4 — Mettre à jour le CORS du backend
```bash
# Récupérez l'URL Vercel (ex: https://clouddemo.vercel.app)
# Puis mettez à jour la variable FRONTEND_URL sur OpenShift :
oc set env deployment/clouddemo-backend FRONTEND_URL=https://clouddemo.vercel.app
```

---

## ÉTAPE 3 — Vérification finale

1. ✅ Allez sur votre URL Vercel
2. ✅ Remplissez le formulaire → cliquez Envoyer
3. ✅ Vous êtes redirigé vers la page d'affichage
4. ✅ Les données s'affichent (lues depuis PostgreSQL sur OpenShift)

---

## 🔧 Commandes utiles

```bash
# Voir les pods OpenShift
oc get pods

# Logs du backend
oc logs deployment/clouddemo-backend -f

# Connexion directe à PostgreSQL
oc rsh deployment/postgresql
psql -U clouddemo_user -d clouddemo
SELECT * FROM messages;

# Redémarrer le backend
oc rollout restart deployment/clouddemo-backend
```

---

## 🌐 Variables d'environnement

| Variable | Où | Description |
|----------|-----|-------------|
| `VITE_API_URL` | Vercel | URL du backend OpenShift |
| `POSTGRES_HOST` | OpenShift Secret | Hostname PostgreSQL |
| `POSTGRES_DB` | OpenShift Secret | Nom de la base |
| `POSTGRES_USER` | OpenShift Secret | Utilisateur DB |
| `POSTGRES_PASSWORD` | OpenShift Secret | Mot de passe DB |
| `FRONTEND_URL` | OpenShift Deployment | URL Vercel (pour CORS) |
