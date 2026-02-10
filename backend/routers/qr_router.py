"""
QR API: Generate QR code for public candidate onboarding form and candidate profiles.
"""
from fastapi import APIRouter
from fastapi.responses import Response
import qrcode
from io import BytesIO
from config import get_settings

router = APIRouter(prefix="/api/qr", tags=["qr"])


@router.get("/public-form")
def get_public_form_qr():
    """Generate and return QR code PNG for the public candidate onboarding form."""
    try:
        # Generate QR code for the public form URL
        settings = get_settings()
        public_form_url = f"{settings.FRONTEND_URL}/apply"
        
        # Create QR code
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=10,
            border=4,
        )
        qr.add_data(public_form_url)
        qr.make(fit=True)
        
        # Generate image
        img = qr.make_image(fill_color="black", back_color="white")
        
        # Convert to bytes
        buffer = BytesIO()
        img.save(buffer, format="PNG")
        buffer.seek(0)
        
        return Response(content=buffer.getvalue(), media_type="image/png")
    except Exception as e:
        print(f"Error generating QR code: {e}")
        raise


@router.get("/candidate/{candidate_id}")
def get_candidate_qr(candidate_id: str):
    """Generate and return QR code PNG for a specific candidate profile."""
    try:
        # Generate QR code for the candidate profile URL
        settings = get_settings()
        candidate_profile_url = f"{settings.FRONTEND_URL}/candidate/{candidate_id}"
        
        # Create QR code
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=10,
            border=4,
        )
        qr.add_data(candidate_profile_url)
        qr.make(fit=True)
        
        # Generate image
        img = qr.make_image(fill_color="black", back_color="white")
        
        # Convert to bytes
        buffer = BytesIO()
        img.save(buffer, format="PNG")
        buffer.seek(0)
        
        return Response(content=buffer.getvalue(), media_type="image/png")
    except Exception as e:
        print(f"Error generating candidate QR code: {e}")
        raise
