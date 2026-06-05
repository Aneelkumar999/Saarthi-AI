import hashlib
import os
import random
import re
from datetime import datetime, timedelta, timezone

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models import models

bearer_scheme = HTTPBearer(auto_error=False)


def normalize_phone(phone: str) -> str:
    digits = re.sub(r"\D", "", phone or "")
    if len(digits) == 10:
        digits = f"91{digits}"
    if len(digits) != 12 or not digits.startswith("91"):
        raise HTTPException(status_code=422, detail="Enter a valid 10-digit Indian mobile number")
    return f"+{digits}"


def generate_otp() -> str:
    if os.getenv("AUTH_DEV_FIXED_OTP", "true").lower() == "true":
        return "123456"
    return f"{random.randint(0, 999999):06d}"


def hash_otp(identifier: str, otp: str) -> str:
    secret = os.getenv("JWT_SECRET", "dev-only-change-me")
    payload = f"{identifier}:{otp}:{secret}".encode("utf-8")
    return hashlib.sha256(payload).hexdigest()


def make_otp_aware(dt: datetime) -> datetime:
    """Make a naive datetime timezone-aware (UTC)."""
    if dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)
    return dt


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


def create_access_token(user: models.User) -> str:
    secret = os.getenv("JWT_SECRET", "dev-only-change-me")
    expires_minutes = int(os.getenv("JWT_EXPIRES_MINUTES", "10080"))
    payload = {
        "sub": str(user.id),
        "phone": user.phone,
        "exp": utc_now() + timedelta(minutes=expires_minutes),
        "iat": utc_now()
    }
    return jwt.encode(payload, secret, algorithm="HS256")


def decode_access_token(token: str) -> dict:
    secret = os.getenv("JWT_SECRET", "dev-only-change-me")
    try:
        return jwt.decode(token, secret, algorithms=["HS256"])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Session expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid session")


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: Session = Depends(get_db)
) -> models.User:
    if not credentials:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication required")

    payload = decode_access_token(credentials.credentials)
    user = db.query(models.User).filter(models.User.id == int(payload["sub"])).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return user


def normalize_phone_optional(phone: str | None) -> str | None:
    """Normalize phone if provided, else return None."""
    if not phone:
        return None
    return normalize_phone(phone)
