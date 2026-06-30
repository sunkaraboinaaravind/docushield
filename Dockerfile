# ── Stage 1: Build React Frontend ──────────────────────────────
FROM node:20-slim AS frontend-builder

WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ .
RUN npm run build

# ── Stage 2: Python Backend + Serve Frontend ────────────────────
FROM python:3.11-slim

# Install system dependencies (tesseract for OCR)
RUN apt-get update && apt-get install -y \
    tesseract-ocr \
    tesseract-ocr-eng \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy backend
COPY backend/requirements.txt ./backend/requirements.txt
RUN pip install --no-cache-dir -r backend/requirements.txt

COPY backend/ ./backend/

# Copy built React frontend from Stage 1
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Set workdir to backend so Python finds analyzer.py
WORKDIR /app/backend

# HuggingFace Spaces uses port 7860
EXPOSE 7860

# Run FastAPI (serves both API + frontend)
CMD ["python", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]
