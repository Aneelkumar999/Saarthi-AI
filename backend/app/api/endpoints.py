from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.schemas.schemas import UserJourneyRequest, ChatRequest, ChatResponse, WorkflowStep
from app.services.ai_service import ai_service
from app.services.workflow_service import workflow_service
from app.core.database import get_db
from app.core.security import get_current_user
from app.models import models
from typing import List

router = APIRouter()

@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest, db: Session = Depends(get_db)):
    intent_data = await ai_service.parse_intent(db, request.message)
    intent_id = intent_data.get("intent_id")

    roadmap = await ai_service.generate_roadmap(db, request.message)
    response_text = roadmap.get("response") if roadmap else await ai_service.get_chat_response(db, request.message)

    if intent_id:
        response_text += f"\n\nI've identified your goal: {intent_data.get('intent_name')}. I'm generating a roadmap for you."

    return ChatResponse(
        response=response_text,
        intent_id=intent_id,
        roadmap=roadmap
    )


@router.get("/workflow/{intent_id}", response_model=List[WorkflowStep])
async def get_workflow(intent_id: int, db: Session = Depends(get_db)):
    steps = workflow_service.get_workflow_for_intent(db, intent_id)
    if not steps:
        raise HTTPException(status_code=404, detail="Workflow not found for this intent")
    return steps


@router.post("/parse-intent")
async def parse_intent(request: UserJourneyRequest, db: Session = Depends(get_db)):
    return await ai_service.parse_intent(db, request.query)


@router.post("/journeys")
async def create_journey(
    body: dict,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    intent_id = body.get("intent_id")
    if not intent_id:
        raise HTTPException(status_code=422, detail="intent_id is required")

    intent = db.query(models.Intent).filter(models.Intent.id == intent_id).first()
    if not intent:
        raise HTTPException(status_code=404, detail="Intent not found")

    existing = db.query(models.UserJourney).filter(
        models.UserJourney.user_id == current_user.id,
        models.UserJourney.intent_id == intent_id,
        models.UserJourney.status == "active"
    ).first()
    if existing:
        return {"journey_id": existing.id, "message": "Active journey already exists"}

    journey = models.UserJourney(user_id=current_user.id, intent_id=intent_id, status="active")
    db.add(journey)
    db.flush()

    intent_services = db.query(models.IntentService).filter(
        models.IntentService.intent_id == intent_id
    ).order_by(models.IntentService.step_order).all()

    for isvc in intent_services:
        db.add(models.JourneyStep(
            journey_id=journey.id,
            service_id=isvc.service_id,
            status="pending"
        ))

    db.commit()
    return {"journey_id": journey.id, "message": "Journey created"}


@router.get("/journeys")
async def list_journeys(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    journeys = db.query(models.UserJourney).filter(
        models.UserJourney.user_id == current_user.id
    ).order_by(models.UserJourney.created_at.desc()).all()

    result = []
    for j in journeys:
        intent = db.query(models.Intent).filter(models.Intent.id == j.intent_id).first()
        steps = db.query(models.JourneyStep).filter(
            models.JourneyStep.journey_id == j.id
        ).all()

        completed = sum(1 for s in steps if s.status == "completed")

        roadmap_template = intent.roadmap_template if intent else {}
        result.append({
            "id": j.id,
            "title": roadmap_template.get("title", f"{intent.name if intent else 'Unknown'} Roadmap") if roadmap_template else f"{intent.name if intent else 'Unknown'} Roadmap",
            "intent_id": j.intent_id,
            "intent_name": intent.name if intent else "Unknown",
            "status": j.status,
            "total_steps": len(steps),
            "completed_steps": completed,
            "created_at": j.created_at.isoformat() if j.created_at else "",
        })

    return result
