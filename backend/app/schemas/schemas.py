from pydantic import BaseModel
from typing import List, Optional, Any
from datetime import datetime

class IntentBase(BaseModel):
    name: str
    description: Optional[str] = None
    trigger_keywords: List[str] = []

class Intent(IntentBase):
    id: int
    class Config:
        from_attributes = True

class ServiceBase(BaseModel):
    name: str
    department: str
    fee: float
    sla_days: int
    description: Optional[str] = None
    required_documents: Optional[List[str]] = ["Aadhaar Card", "Address Proof"]

class Service(ServiceBase):
    id: int
    class Config:
        from_attributes = True

class WorkflowStep(BaseModel):
    service: Service
    status: str
    dependencies: List[int] = []

class UserJourneyRequest(BaseModel):
    query: str

class ChatRequest(BaseModel):
    message: str
    journey_id: Optional[str] = None

class ChatResponse(BaseModel):
    response: str
    intent_id: Optional[int] = None
    workflow_id: Optional[str] = None
    roadmap: Optional[dict[str, Any]] = None

class OtpSendRequest(BaseModel):
    phone: Optional[str] = None
    email: Optional[str] = None

class OtpSendResponse(BaseModel):
    message: str
    expires_in_seconds: int
    dev_otp: Optional[str] = None
    channel: str = "phone"  # phone or email

class OtpVerifyRequest(BaseModel):
    phone: Optional[str] = None
    email: Optional[str] = None
    otp: str

class SignupRequest(BaseModel):
    full_name: str
    phone: Optional[str] = None
    email: Optional[str] = None
    auth_provider: str = "phone"  # phone, email, google

class SignupResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "AuthUserResponse"

class GoogleAuthRequest(BaseModel):
    token: str  # Google ID token (mock for now)
    full_name: Optional[str] = None
    email: Optional[str] = None
    avatar_url: Optional[str] = None

class AuthUserResponse(BaseModel):
    id: int
    phone: Optional[str] = None
    email: Optional[str] = None
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None
    auth_provider: Optional[str] = None

    class Config:
        from_attributes = True

class OtpVerifyResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: AuthUserResponse

class UserProfileResponse(BaseModel):
    id: int
    user_id: int
    full_name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    location: Optional[str] = None
    district: Optional[str] = None
    citizen_type: Optional[str] = None
    preferred_language: Optional[str] = None
    dob: Optional[str] = None
    demographics: Optional[dict[str, Any]] = None
    consent_document_reuse: Optional[int] = None
    class Config:
        from_attributes = True

class UserProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    location: Optional[str] = None
    district: Optional[str] = None
    citizen_type: Optional[str] = None
    preferred_language: Optional[str] = None
    dob: Optional[str] = None
    demographics: Optional[dict[str, Any]] = None

class SchemeResponse(BaseModel):
    id: int
    name: str
    benefit: Optional[str] = None
    eligibility_rules: Optional[dict[str, Any]] = None
    description: Optional[str] = None
    category: Optional[str] = None
    fit_score: Optional[str] = None
    class Config:
        from_attributes = True

class DashboardStats(BaseModel):
    active_journeys: int
    completed_steps: int
    total_steps: int
    uploaded_documents: int
    eligible_schemes: int
    days_saved: int
    recent_activities: list[dict[str, Any]]

class ServiceCreate(BaseModel):
    name: str
    department: str
    fee: float = 0.0
    sla_days: int = 7
    description: Optional[str] = None

class ServiceResponse(BaseModel):
    id: int
    name: str
    department: str
    fee: float
    sla_days: int
    description: Optional[str] = None
    class Config:
        from_attributes = True
