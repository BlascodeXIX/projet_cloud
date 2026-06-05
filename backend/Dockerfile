# Dockerfile — FastAPI backend pour OpenShift
# OpenShift run containers as non-root by default

FROM python:3.11-slim

# OpenShift exige UID arbitraire → pas d'utilisateur root fixe
WORKDIR /app

# Dépendances système
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq-dev gcc \
    && rm -rf /var/lib/apt/lists/*

# Python deps
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Code source
COPY . .

# Permissions pour OpenShift (UID aléatoire)
RUN chmod -R g+rwX /app

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
