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
    phone: str

class OtpSendResponse(BaseModel):
    message: str
    expires_in_seconds: int
    dev_otp: Optional[str] = None

class OtpVerifyRequest(BaseModel):
    phone: str
    otp: str

class AuthUserResponse(BaseModel):
    id: int
    phone: str
    full_name: Optional[str] = None

    class Config:
        from_attributes = True

class OtpVerifyResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: AuthUserResponse
