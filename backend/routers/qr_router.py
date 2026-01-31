"""
QR API: serve candidate QR image by candidate_id.
"""
from fastapi import APIRouter, HTTPException
from fastapi.responses import Response

from services.qr_service import get_qr_image_bytes

router = APIRouter(prefix="/api/qr", tags=["qr"])


@router.get("/{candidate_id}")
def get_qr(candidate_id: str):
    """Return PNG image for candidate QR. 404 if not found."""
    data = get_qr_image_bytes(candidate_id)
    if not data:
        raise HTTPException(status_code=404, detail="QR not found")
    return Response(content=data, media_type="image/png")
