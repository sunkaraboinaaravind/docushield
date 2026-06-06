# 🛡️ DocuShield

**AI-Powered Real-Time Document Tampering Detection for Loan Underwriting**

> Submitted for **SuRaksha Cyber Hackathon 2.0** — Canara Bank × HackerEarth 2026  
> Team **Sun Rises** | Institute of Aeronautical Engineering

---

## 📌 Overview

DocuShield detects forged and tampered loan documents in **real-time** using a 3-layer AI forensic pipeline — before fraud enters the underwriting pipeline.

| Layer | Technique | Detects |
|-------|-----------|---------|
| 🔬 Layer 1 | Error Level Analysis (ELA) | Pixel manipulation, copy-paste regions |
| 🧠 Layer 2 | CNN Deep Learning (simulation) | Font inconsistencies, stamp irregularities |
| 📝 Layer 3 | OCR + NLP Cross-check | Date anomalies, numeric inconsistencies |

---

## 🚀 Quick Start

### Backend (FastAPI)
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn main:app --port 8000 --reload
```
> API runs at `http://localhost:8000`  
> Swagger docs at `http://localhost:8000/docs`

### Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev
```
> UI runs at `http://localhost:5173`

---

## 🛠️ Tech Stack

| Component | Technology |
|-----------|-----------|
| Frontend | React 18 + Vite + Vanilla CSS |
| Backend | Python FastAPI + Uvicorn |
| Image Forensics | Pillow + NumPy (ELA) |
| OCR | pytesseract |
| Privacy | 100% on-premise — no data leaves the server |

---

## 🖥️ Features

- **Drag & Drop Upload** — JPG, PNG, PDF support
- **3-Layer Animated Pipeline** — real-time progress visualization
- **Authenticity Score Gauge** — 0–100% with animated circular gauge
- **Forensic Heatmap Overlay** — highlights exact tampered regions in red
- **Risk Classification** — LOW / MEDIUM / HIGH with color-coded badges
- **Anomaly Report Table** — per-layer breakdown of detected issues
- **Explainable AI** — visual output, not a black-box result

---

## 📁 Project Structure

```
docushield/
├── backend/
│   ├── main.py          # FastAPI app + routes
│   ├── analyzer.py      # ELA + CNN + OCR detection pipeline
│   └── requirements.txt
└── frontend/
    ├── src/
    │   ├── App.jsx      # All React components
    │   └── index.css    # Dark glassmorphism design system
    └── package.json
```

---

## 👤 Team

**Team Sun Rises**  
- **Sunkaraboina Aravind** — sunkaraboinaaravind123@gmail.com  
- Institute of Aeronautical Engineering

---

*SuRaksha Cyber Hackathon 2.0 | Canara Bank | May 2026*
