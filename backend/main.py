import os
import io
import time
from pathlib import Path
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from analyzer import analyze_document

# Path to the built React frontend (../frontend/dist)
FRONTEND_DIST = Path(__file__).parent.parent / "frontend" / "dist"

app = FastAPI(
    title="DocuShield API",
    description="AI-Powered Real-Time Document Tampering Detection",
    version="1.0.0"
)

# CORS (kept for dev flexibility)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve React static assets (JS, CSS, images) from /assets
if FRONTEND_DIST.exists():
    app.mount("/assets", StaticFiles(directory=str(FRONTEND_DIST / "assets")), name="assets")

ALLOWED_TYPES = {
    "image/jpeg", "image/jpg", "image/png",
    "image/tiff", "application/pdf"
}

MAX_SIZE_MB = 20


@app.get("/api/health")
def health():
    return {"status": "ok", "service": "DocuShield", "version": "1.0.0"}


@app.post("/api/analyze")
async def analyze(file: UploadFile = File(...)):
    # Validate file type
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type: {file.content_type}. Accepted: JPEG, PNG, TIFF, PDF."
        )

    contents = await file.read()

    # Validate size
    size_mb = len(contents) / (1024 * 1024)
    if size_mb > MAX_SIZE_MB:
        raise HTTPException(
            status_code=400,
            detail=f"File too large ({size_mb:.1f} MB). Maximum allowed: {MAX_SIZE_MB} MB."
        )

    # Handle PDF: extract first page as image
    if file.content_type == "application/pdf":
        try:
            contents = pdf_to_image(contents)
        except Exception as e:
            raise HTTPException(status_code=422, detail=f"PDF processing failed: {str(e)}")

    start = time.perf_counter()

    try:
        result = analyze_document(contents, file.filename or "document")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

    elapsed_ms = round((time.perf_counter() - start) * 1000)
    result["processing_time_ms"] = elapsed_ms

    return JSONResponse(content=result)


# ── SPA Fallback ────────────────────────────────────────────────
# Serve index.html for all non-API routes (React Router support)
@app.get("/")
@app.get("/{full_path:path}")
async def serve_spa(full_path: str = ""):
    index = FRONTEND_DIST / "index.html"
    if FRONTEND_DIST.exists() and index.exists():
        return FileResponse(str(index))
    return JSONResponse(
        {"message": "DocuShield API running. Frontend not built yet — run: cd frontend && npm run build"},
        status_code=200
    )


def pdf_to_image(pdf_bytes: bytes) -> bytes:
    """Convert first page of PDF to PNG bytes."""
    try:
        import fitz  # PyMuPDF
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
        page = doc[0]
        pix = page.get_pixmap(dpi=150)
        return pix.tobytes("png")
    except ImportError:
        # Try pdf2image as fallback
        try:
            from pdf2image import convert_from_bytes
            images = convert_from_bytes(pdf_bytes, first_page=1, last_page=1, dpi=150)
            buf = io.BytesIO()
            images[0].save(buf, format="PNG")
            return buf.getvalue()
        except ImportError:
            raise RuntimeError(
                "PDF support requires PyMuPDF or pdf2image. "
                "Install with: pip install PyMuPDF"
            )
