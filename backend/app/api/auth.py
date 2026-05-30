import os
from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import create_access_token, generate_otp, get_current_user, hash_otp, normalize_phone, utc_now
from app.models import models
from app.schemas.schemas import AuthUserResponse, OtpSendRequest, OtpSendResponse, OtpVerifyRequest, OtpVerifyResponse

router = APIRouter()


@router.post("/otp/send", response_model=OtpSendResponse)
def send_otp(request: OtpSendRequest, db: Session = Depends(get_db)):
    phone = normalize_phone(request.phone)
    otp = generate_otp()
    expiry_minutes = int(os.getenv("OTP_EXPIRES_MINUTES", "5"))

    db.query(models.OtpCode).filter(
        models.OtpCode.phone == phone,
        models.OtpCode.consumed_at.is_(None)
    ).update({"consumed_at": utc_now()})

    db.add(models.OtpCode(
        phone=phone,
        otp_hash=hash_otp(phone, otp),
        expires_at=utc_now() + timedelta(minutes=expiry_minutes)
    ))
    db.commit()

    dev_mode = os.getenv("AUTH_DEV_MODE", "true").lower() == "true"
    return OtpSendResponse(
        message="OTP sent successfully",
        expires_in_seconds=expiry_minutes * 60,
        dev_otp=otp if dev_mode else None
    )


@router.post("/otp/verify", response_model=OtpVerifyResponse)
def verify_otp(request: OtpVerifyRequest, db: Session = Depends(get_db)):
    phone = normalize_phone(request.phone)
    otp = (request.otp or "").strip()
    max_attempts = int(os.getenv("OTP_MAX_ATTEMPTS", "5"))

    if len(otp) != 6 or not otp.isdigit():
        raise HTTPException(status_code=422, detail="Enter the 6-digit OTP")

    otp_record = db.query(models.OtpCode).filter(
        models.OtpCode.phone == phone,
        models.OtpCode.consumed_at.is_(None)
    ).order_by(models.OtpCode.created_at.desc()).first()

    if not otp_record:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Request a new OTP")

    if otp_record.expires_at < utc_now():
        otp_record.consumed_at = utc_now()
        db.commit()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="OTP expired")

    if otp_record.attempts >= max_attempts:
        otp_record.consumed_at = utc_now()
        db.commit()
        raise HTTPException(status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail="Too many OTP attempts")

    if otp_record.otp_hash != hash_otp(phone, otp):
        otp_record.attempts += 1
        db.commit()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid OTP")

    otp_record.consumed_at = utc_now()
    user = db.query(models.User).filter(models.User.phone == phone).first()
    if not user:
        user = models.User(phone=phone, full_name="Citizen")
        db.add(user)
        db.flush()

    db.commit()
    db.refresh(user)

    return OtpVerifyResponse(access_token=create_access_token(user), user=user)


@router.get("/me", response_model=AuthUserResponse)
def me(current_user: models.User = Depends(get_current_user)):
    return current_user
