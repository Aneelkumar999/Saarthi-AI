from sqlalchemy import Column, Integer, String, Float, Text, ARRAY, ForeignKey, TIMESTAMP, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    phone = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String)
    demographics = Column(JSON)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())

class OtpCode(Base):
    __tablename__ = "otp_codes"
    id = Column(Integer, primary_key=True, index=True)
    phone = Column(String, index=True, nullable=False)
    otp_hash = Column(String, nullable=False)
    expires_at = Column(TIMESTAMP(timezone=True), nullable=False)
    attempts = Column(Integer, default=0, nullable=False)
    consumed_at = Column(TIMESTAMP(timezone=True), nullable=True)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())

class Intent(Base):
    __tablename__ = "intents"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text)
    trigger_keywords = Column(ARRAY(String))
    roadmap_template = Column(JSON, nullable=True)

    services = relationship("IntentService", back_populates="intent")

class Service(Base):
    __tablename__ = "services"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    department = Column(String)
    fee = Column(Float)
    sla_days = Column(Integer)
    description = Column(Text)

class ServiceDependency(Base):
    __tablename__ = "service_dependencies"
    id = Column(Integer, primary_key=True, index=True)
    service_id = Column(Integer, ForeignKey("services.id"))
    requires_service_id = Column(Integer, ForeignKey("services.id"))

class IntentService(Base):
    __tablename__ = "intent_services"
    id = Column(Integer, primary_key=True, index=True)
    intent_id = Column(Integer, ForeignKey("intents.id"))
    service_id = Column(Integer, ForeignKey("services.id"))
    step_order = Column(Integer, nullable=False)
    
    intent = relationship("Intent", back_populates="services")
    service = relationship("Service")

class UserJourney(Base):
    __tablename__ = "user_journeys"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    intent_id = Column(Integer, ForeignKey("intents.id"))
    status = Column(String, default="active")
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())

class JourneyStep(Base):
    __tablename__ = "journey_steps"
    id = Column(Integer, primary_key=True, index=True)
    journey_id = Column(Integer, ForeignKey("user_journeys.id"))
    service_id = Column(Integer, ForeignKey("services.id"))
    status = Column(String, default="pending")
    updated_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), onupdate=func.now())

class Scheme(Base):
    __tablename__ = "schemes"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    eligibility_rules = Column(JSON)
    description = Column(Text)

class UserProfile(Base):
    __tablename__ = "user_profiles"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    full_name = Column(String)
    phone = Column(String)
    email = Column(String, nullable=True)
    location = Column(String, default="Telangana")
    district = Column(String, default="Hyderabad")
    citizen_type = Column(String, default="general")
    preferred_language = Column(String, default="English")
    demographics = Column(JSON, default={})
    consent_document_reuse = Column(Integer, default=1)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    updated_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), onupdate=func.now())

class UserDocument(Base):
    __tablename__ = "user_documents"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    doc_type = Column(String, nullable=False)
    filename = Column(String)
    raw_text = Column(Text, nullable=True)
    extracted_data = Column(JSON, default={})
    confidence = Column(String, default="0%")
    status = Column(String, default="uploaded")
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())

class UserScheme(Base):
    __tablename__ = "user_schemes"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    scheme_id = Column(Integer, ForeignKey("schemes.id"))
    status = Column(String, default="recommended")
    applied_at = Column(TIMESTAMP(timezone=True), nullable=True)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())

class AuditLog(Base):
    __tablename__ = "audit_logs"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    action = Column(String, nullable=False)
    detail = Column(JSON, default={})
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
