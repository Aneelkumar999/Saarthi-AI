import os
from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import (
    create_access_token, generate_otp, get_current_user,
    hash_otp, make_otp_aware, utc_now,
)
from app.models import models
from app.schemas.schemas import (
    AuthUserResponse, GoogleAuthRequest, OtpSendRequest, OtpSendResponse,
    OtpVerifyRequest, OtpVerifyResponse, SignupRequest, SignupResponse,
)

router = APIRouter()


def _validate_phone(phone: str) -> str:
    """Normalize and validate Indian phone number. Returns +91XXXXXXXXXX."""
    import re
    if not phone:
        raise HTTPException(status_code=422, detail="Phone number is required")
    
    # Remove all non-digits
    digits = re.sub(r"\D", "", phone)
    
    # Handle leading zero (common in some contexts)
    if len(digits) == 11 and digits.startswith("0"):
        digits = digits[1:]
        
    # Standard 10-digit number -> prepend 91
    if len(digits) == 10:
        digits = f"91{digits}"
    
    # Final check: should be exactly 12 digits (91 + 10 digits)
    if len(digits) != 12 or not digits.startswith("91"):
        raise HTTPException(status_code=422, detail="Enter a valid 10-digit Indian mobile number")
        
    return f"+{digits}"


def _validate_email(email: str) -> str:
    """Basic email validation."""
    email = (email or "").strip()
    if "@" not in email or "." not in email.split("@")[-1]:
        raise HTTPException(status_code=422, detail="Enter a valid email address")
    return email.lower()


@router.post("/signup", response_model=SignupResponse)
def signup(request: SignupRequest, db: Session = Depends(get_db)):
    """Register a new user with name, phone/email, or Google."""
    phone = None
    email = None

    if request.phone:
        phone = _validate_phone(request.phone)
    if request.email:
        email = _validate_email(request.email)

    if not phone and not email:
        raise HTTPException(status_code=422, detail="Phone or email is required")

    # Check if user already exists
    existing = None
    if phone:
        existing = db.query(models.User).filter(models.User.phone == phone).first()
    if not existing and email:
        existing = db.query(models.User).filter(models.User.email == email).first()

    if existing:
        raise HTTPException(status_code=409, detail="Account already exists. Please sign in.")

    user = models.User(
        phone=phone,
        email=email,
        full_name=request.full_name,
        auth_provider=request.auth_provider,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    return SignupResponse(
        access_token=create_access_token(user),
        user=user,
    )


@router.post("/otp/send", response_model=OtpSendResponse)
def send_otp(request: OtpSendRequest, db: Session = Depends(get_db)):
    """Send OTP to phone or email for login/signup."""
    phone = None
    email = None

    if request.phone:
        phone = _validate_phone(request.phone)
    if request.email:
        email = _validate_email(request.email)

    if not phone and not email:
        raise HTTPException(status_code=422, detail="Phone or email is required")

    identifier = phone or email
    channel = "phone" if phone else "email"

    # Create OTP
    query = db.query(models.OtpCode).filter(models.OtpCode.consumed_at.is_(None))
    if phone:
        query = query.filter(models.OtpCode.phone == phone)
    else:
        query = query.filter(models.OtpCode.email == email)
    query.update({"consumed_at": utc_now()})

    otp = generate_otp()
    expiry_minutes = int(os.getenv("OTP_EXPIRES_MINUTES", "5"))

    db.add(models.OtpCode(
        phone=phone,
        email=email,
        otp_hash=hash_otp(identifier, otp),
        expires_at=utc_now() + timedelta(minutes=expiry_minutes),
    ))
    db.commit()

    dev_mode = os.getenv("AUTH_DEV_MODE", "true").lower() == "true"

    if channel == "phone":
        msg = "OTP sent to your phone"
    else:
        msg = f"OTP sent to {email}"

    return OtpSendResponse(
        message=msg,
        expires_in_seconds=expiry_minutes * 60,
        dev_otp=otp if dev_mode else None,
        channel=channel,
    )


@router.post("/otp/verify", response_model=OtpVerifyResponse)
def verify_otp(request: OtpVerifyRequest, db: Session = Depends(get_db)):
    """Verify OTP and login."""
    phone = None
    email = None

    if request.phone:
        phone = _validate_phone(request.phone)
    if request.email:
        email = _validate_email(request.email)

    if not phone and not email:
        raise HTTPException(status_code=422, detail="Phone or email is required")

    otp = (request.otp or "").strip()
    max_attempts = int(os.getenv("OTP_MAX_ATTEMPTS", "5"))

    if len(otp) != 6 or not otp.isdigit():
        raise HTTPException(status_code=422, detail="Enter the 6-digit OTP")

    identifier = phone or email

    # Find OTP record
    query = db.query(models.OtpCode).filter(
        models.OtpCode.consumed_at.is_(None),
    )
    if phone:
        query = query.filter(models.OtpCode.phone == phone)
    else:
        query = query.filter(models.OtpCode.email == email)

    otp_record = query.order_by(models.OtpCode.created_at.desc()).first()

    if not otp_record:
        raise HTTPException(status_code=400, detail="Request a new OTP")

    if make_otp_aware(otp_record.expires_at) < utc_now():
        otp_record.consumed_at = utc_now()
        db.commit()
        raise HTTPException(status_code=400, detail="OTP expired")

    if otp_record.attempts >= max_attempts:
        otp_record.consumed_at = utc_now()
        db.commit()
        raise HTTPException(status_code=429, detail="Too many OTP attempts")

    if otp_record.otp_hash != hash_otp(identifier, otp):
        otp_record.attempts += 1
        db.commit()
        raise HTTPException(status_code=400, detail="Invalid OTP")

    otp_record.consumed_at = utc_now()

    # Find or create user
    user = None
    if phone:
        user = db.query(models.User).filter(models.User.phone == phone).first()
    if not user and email:
        user = db.query(models.User).filter(models.User.email == email).first()

    if not user:
        # Auto-create user on first login
        user = models.User(
            phone=phone,
            email=email,
            full_name="Citizen",
            auth_provider="phone" if phone else "email",
        )
        db.add(user)
        db.flush()

    db.commit()
    db.refresh(user)

    return OtpVerifyResponse(access_token=create_access_token(user), user=user)


@router.post("/google", response_model=SignupResponse)
def google_auth(request: GoogleAuthRequest, db: Session = Depends(get_db)):
    """Google OAuth login/signup (mock for MVP)."""
    # In production, verify the Google ID token here
    # For MVP, we trust the frontend-provided data
    email = request.email
    if not email:
        raise HTTPException(status_code=422, detail="Email is required from Google auth")

    email = _validate_email(email)

    # Find existing user
    user = db.query(models.User).filter(models.User.email == email).first()

    if not user:
        # Create new user
        user = models.User(
            email=email,
            full_name=request.full_name or "Google User",
            avatar_url=request.avatar_url,
            auth_provider="google",
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    return SignupResponse(
        access_token=create_access_token(user),
        user=user,
    )


@router.get("/me", response_model=AuthUserResponse)
def me(current_user: models.User = Depends(get_current_user)):
    return current_user
