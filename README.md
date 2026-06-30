---
title: DocuShield
emoji: 🛡️
colorFrom: blue
colorTo: cyan
sdk: docker
pinned: false
license: mit
short_description: AI-Powered Real-Time Document Tampering Detection
---

# 🛡️ DocuShield

**AI-Powered Real-Time Document Tampering Detection for Loan Underwriting**

> SuRaksha Cyber Hackathon 2.0 — Canara Bank × HackerEarth 2026  
> Team **Sun Rises** | Institute of Aeronautical Engineering

## How It Works
Upload any scanned document (salary slip, land record, income certificate) and DocuShield runs a **3-layer forensic pipeline**:

| Layer | Technique | Detects |
|-------|-----------|---------|
| 🔬 Layer 1 | Error Level Analysis (ELA) | Pixel manipulation, copy-paste regions |
| 🧠 Layer 2 | CNN Deep Learning | Font inconsistencies, stamp irregularities |
| 📝 Layer 3 | OCR + NLP | Date anomalies, numeric inconsistencies |

## Quick Start
Just upload a JPG, PNG, or PDF — results appear in under 3 seconds!

## Tech Stack
- **Frontend:** React 18 + Vite
- **Backend:** Python FastAPI
- **Forensics:** Pillow + NumPy (ELA engine)
- **OCR:** Tesseract
