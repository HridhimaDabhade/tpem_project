"""
QR code generation for candidates.
Stores QR as file; path saved on candidate document.
"""
from pathlib import Path
from datetime import datetime

import qrcode
from pymongo.database import Database

from database import CANDIDATES


QR_DIR = Path(__file__).resolve().parent.parent / "static" / "qr"
QR_DIR.mkdir(parents=True, exist_ok=True)
QR_URL_PREFIX = "/static/qr"


def _ensure_qr_dir() -> Path:
    QR_DIR.mkdir(parents=True, exist_ok=True)
    return QR_DIR


def generate_qr_for_candidate(db: Database, candidate_doc: dict, base_url: str = "") -> str:
    """Generate QR code. Saves to static/qr/{candidate_id}.png, updates candidate.qr_code_path, returns path."""
    _ensure_qr_dir()
    candidate_id = candidate_doc.get("candidate_id", "")
    payload = candidate_id
    if base_url:
        payload = f"{base_url.rstrip('/')}/candidate/{candidate_id}"

    qr = qrcode.QRCode(version=1, box_size=8, border=4)
    qr.add_data(payload)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")

    filename = f"{candidate_id}.png".replace("/", "-")
    path = QR_DIR / filename
    img.save(path)
    rel = f"{QR_URL_PREFIX}/{filename}"
    db[CANDIDATES].update_one(
        {"_id": candidate_doc["_id"]},
        {"$set": {"qr_code_path": rel, "updated_at": datetime.utcnow()}},
    )
    return rel


def get_qr_image_bytes(candidate_id: str) -> bytes | None:
    """Return raw PNG bytes for candidate QR, or None if not found."""
    filename = f"{candidate_id}.png".replace("/", "-")
    path = QR_DIR / filename
    if not path.exists():
        return None
    return path.read_bytes()
