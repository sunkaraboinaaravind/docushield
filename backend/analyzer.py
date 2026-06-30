import io
import uuid
import base64
import math
import random
from PIL import Image, ImageChops, ImageEnhance, ImageFilter, ImageDraw
import numpy as np


def sanitize_json(obj):
    """Recursively convert numpy types to native Python types for JSON serialization."""
    if isinstance(obj, dict):
        return {k: sanitize_json(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [sanitize_json(i) for i in obj]
    elif isinstance(obj, (np.float32, np.float64, np.floating)):
        return float(obj)
    elif isinstance(obj, (np.int32, np.int64, np.integer)):
        return int(obj)
    elif isinstance(obj, np.bool_):
        return bool(obj)
    elif isinstance(obj, np.ndarray):
        return sanitize_json(obj.tolist())
    return obj

def perform_ela(image_bytes: bytes, quality: int = 85) -> tuple[Image.Image, float]:
    """
    Error Level Analysis: detect re-saved / edited regions.
    Returns the ELA image and a suspicion score (0=clean, 100=heavily tampered).
    """
    original = Image.open(io.BytesIO(image_bytes)).convert("RGB")

    # Re-compress at known quality
    buffer = io.BytesIO()
    original.save(buffer, format="JPEG", quality=quality)
    buffer.seek(0)
    recompressed = Image.open(buffer).convert("RGB")

    # Compute pixel-wise absolute difference
    diff = ImageChops.difference(original, recompressed)

    # Amplify for visibility
    extrema = diff.getextrema()
    max_diff = max([ex[1] for ex in extrema]) or 1
    scale = 255.0 / max_diff
    ela_image = diff.point(lambda p: int(p * scale * 10))

    # Calculate suspicion score from ELA intensity
    ela_array = np.array(ela_image)
    mean_intensity = ela_array.mean()
    suspicion = min(100.0, mean_intensity * 2.5)

    return ela_image, float(suspicion)


def generate_heatmap(original_bytes: bytes, ela_image: Image.Image) -> str:
    """
    Overlay ELA heatmap on original document image.
    Returns base64-encoded PNG.
    """
    original = Image.open(io.BytesIO(original_bytes)).convert("RGBA")
    ela_rgb = ela_image.convert("RGBA").resize(original.size, Image.LANCZOS)

    # Create red-channel heatmap overlay
    ela_array = np.array(ela_rgb)
    heat = np.zeros_like(ela_array)
    heat[:, :, 0] = ela_array[:, :, 0]  # Red channel
    heat[:, :, 3] = (ela_array[:, :, 0] * 0.7).astype(np.uint8)  # Alpha

    heat_img = Image.fromarray(heat.astype(np.uint8), "RGBA")
    result = Image.alpha_composite(original, heat_img)

    buf = io.BytesIO()
    result.convert("RGB").save(buf, format="PNG")
    return base64.b64encode(buf.getvalue()).decode("utf-8")


def analyze_cnn_layer(image_bytes: bytes, ela_suspicion: float) -> dict:
    """
    CNN simulation layer: rule-based heuristics on pixel variance
    and edge irregularity to simulate deep learning anomaly detection.
    """
    img = Image.open(io.BytesIO(image_bytes)).convert("L")  # Grayscale
    img_array = np.array(img, dtype=np.float32)

    # Font consistency via local variance
    from numpy.lib.stride_tricks import sliding_window_view
    # Simplified: compute global variance per block
    h, w = img_array.shape
    block_size = 32
    variances = []
    for i in range(0, h - block_size, block_size):
        for j in range(0, w - block_size, block_size):
            block = img_array[i:i+block_size, j:j+block_size]
            variances.append(float(np.var(block)))

    if not variances:
        variances = [0.0]

    mean_var = np.mean(variances)
    std_var = np.std(variances)

    # Outlier blocks suggest inconsistency
    outlier_count = sum(1 for v in variances if abs(v - mean_var) > 2 * std_var)
    outlier_ratio = outlier_count / max(len(variances), 1)

    # Edge irregularity
    edges = img.filter(ImageFilter.FIND_EDGES)
    edge_array = np.array(edges, dtype=np.float32)
    edge_density = edge_array.mean()

    # Combine signals
    cnn_suspicion = min(100.0, (outlier_ratio * 40) + (ela_suspicion * 0.3) + (edge_density * 0.5))

    anomalies = []
    if outlier_ratio > 0.1:
        anomalies.append({"type": "Font Inconsistency", "confidence": round(outlier_ratio * 100, 1), "severity": "Medium"})
    if edge_density > 30:
        anomalies.append({"type": "Edge Irregularity", "confidence": round(min(edge_density * 1.5, 95), 1), "severity": "Low"})
    if ela_suspicion > 50:
        anomalies.append({"type": "Stamp / Seal Mismatch", "confidence": round(ela_suspicion * 0.8, 1), "severity": "High"})

    return {
        "score": round(100 - cnn_suspicion, 1),
        "suspicion": round(cnn_suspicion, 1),
        "anomalies": anomalies
    }


def analyze_ocr_layer(image_bytes: bytes) -> dict:
    """
    OCR + NLP cross-check layer.
    Returns text anomalies. Falls back gracefully if tesseract not installed.
    """
    issues = []
    extracted_text = ""

    try:
        import pytesseract
        img = Image.open(io.BytesIO(image_bytes))
        extracted_text = pytesseract.image_to_string(img)

        import re

        # Check for date anomalies
        dates = re.findall(r'\b(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{2,4})\b', extracted_text)
        for d in dates:
            day, month, year = int(d[0]), int(d[1]), int(d[2])
            year = year if year > 100 else 2000 + year
            if month > 12 or day > 31 or year > 2026:
                issues.append({"type": "Invalid Date", "detail": f"Suspicious date: {d[0]}/{d[1]}/{d[2]}", "severity": "High"})

        # Check for numeric inconsistencies (large duplicate amounts)
        amounts = re.findall(r'(?:Rs\.?|INR|₹)?\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)', extracted_text)
        if len(amounts) != len(set(amounts)) and len(amounts) > 3:
            issues.append({"type": "Numeric Duplication", "detail": "Repeated financial figures detected", "severity": "Medium"})

        # Suspicious keywords
        suspicious_words = ["cancelled", "void", "specimen", "sample", "demo", "test"]
        for word in suspicious_words:
            if word.lower() in extracted_text.lower():
                issues.append({"type": "Specimen / Void Watermark", "detail": f"Found keyword: '{word}'", "severity": "High"})

    except Exception:
        # Tesseract not available — use heuristic placeholder
        issues.append({"type": "OCR Unavailable", "detail": "Install Tesseract for full text analysis", "severity": "Info"})

    ocr_suspicion = min(100.0, len([i for i in issues if i["severity"] != "Info"]) * 25.0)

    return {
        "score": round(100 - ocr_suspicion, 1),
        "suspicion": round(ocr_suspicion, 1),
        "text_issues": issues,
        "text_length": len(extracted_text)
    }


def compute_final_score(ela_suspicion: float, cnn_suspicion: float, ocr_suspicion: float) -> tuple[float, str]:
    """
    Weighted combination of all three layers into final authenticity score.
    """
    # Weights: ELA 40%, CNN 35%, OCR 25%
    combined_suspicion = (ela_suspicion * 0.40) + (cnn_suspicion * 0.35) + (ocr_suspicion * 0.25)
    authenticity = round(100.0 - combined_suspicion, 1)
    authenticity = max(0.0, min(100.0, authenticity))

    if authenticity >= 75:
        risk = "LOW"
    elif authenticity >= 45:
        risk = "MEDIUM"
    else:
        risk = "HIGH"

    return authenticity, risk


def analyze_document(image_bytes: bytes, filename: str) -> dict:
    """
    Main analysis pipeline. Runs all three layers and returns full report.
    """
    doc_id = str(uuid.uuid4())

    # Layer 1: ELA
    ela_image, ela_suspicion = perform_ela(image_bytes)
    heatmap_b64 = generate_heatmap(image_bytes, ela_image)

    ela_result = {
        "score": round(100 - ela_suspicion, 1),
        "suspicion": round(ela_suspicion, 1),
        "regions": []
    }
    if ela_suspicion > 30:
        ela_result["regions"].append({"label": "Suspected edited region", "confidence": round(ela_suspicion, 1)})

    # Layer 2: CNN simulation
    cnn_result = analyze_cnn_layer(image_bytes, ela_suspicion)

    # Layer 3: OCR + NLP
    ocr_result = analyze_ocr_layer(image_bytes)

    # Final score
    authenticity, risk = compute_final_score(ela_suspicion, cnn_result["suspicion"], ocr_result["suspicion"])

    # Summary text
    summaries = {
        "LOW": "Document appears authentic. No significant anomalies detected across forensic layers.",
        "MEDIUM": "Moderate anomalies detected. Manual review recommended before proceeding.",
        "HIGH": "High probability of document tampering. Escalate for detailed forensic investigation."
    }

    result = {
        "document_id": doc_id,
        "filename": filename,
        "authenticity_score": authenticity,
        "risk_level": risk,
        "summary": summaries[risk],
        "layers": {
            "ela": ela_result,
            "cnn": cnn_result,
            "ocr": ocr_result
        },
        "heatmap_base64": heatmap_b64
    }
    # Sanitize all numpy types before JSON serialization
    return sanitize_json(result)
