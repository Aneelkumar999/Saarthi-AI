import os
import asyncio
import json
import re
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from dotenv import load_dotenv
from sqlalchemy.orm import Session
from app.models import models

try:
    import google.generativeai as genai
except ImportError:
    genai = None

load_dotenv()

class AIService:
    def __init__(self):
        self.api_key = os.getenv("OPENAI_API_KEY")
        self.gemini_api_key = os.getenv("GEMINI_API_KEY")
        
        # Check if keys are placeholders
        if self.api_key == "your_openai_api_key_here":
            self.api_key = None
        if self.gemini_api_key == "your_gemini_api_key_here":
            self.gemini_api_key = None

        self.gemini_model = None
        if genai and self.gemini_api_key:
            genai.configure(api_key=self.gemini_api_key)
            self.gemini_model = genai.GenerativeModel(os.getenv("GEMINI_MODEL", "gemini-2.0-flash"))
        
        if self.api_key:
            self.llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.7)
        else:
            self.llm = None

    def _get_available_intents(self, db: Session):
        intents = db.query(models.Intent).all()
        return [{"id": i.id, "name": i.name, "description": i.description} for i in intents]

    async def parse_intent(self, db: Session, query: str):
        intents = self._get_available_intents(db)

        # 1. Keyword Matching with scoring (Fast & Free)
        query_lower = query.lower()
        best_intent = None
        best_score = 0

        for i in intents:
            score = 0
            name_words = i['name'].lower().split()
            for word in name_words:
                if len(word) > 3 and word in query_lower:
                    score += 2
            # Also check full name match
            if i['name'].lower() in query_lower:
                score += 5
            # Check trigger keywords if available
            intent_obj = db.query(models.Intent).filter(models.Intent.id == i['id']).first()
            if intent_obj and intent_obj.trigger_keywords:
                for kw in intent_obj.trigger_keywords:
                    if kw.lower() in query_lower:
                        score += 3
            if score > best_score:
                best_score = score
                best_intent = i

        if best_intent and best_score >= 2:
            return {"intent_id": best_intent['id'], "intent_name": best_intent['name']}

        # 2. Try OpenAI if available
        if self.llm:
            intent_descriptions = "\n".join([f"- ID {i['id']}: {i['name']} ({i['description']})" for i in intents])
            prompt = ChatPromptTemplate.from_template(
                "You are a government service assistant. Parse the citizen query and identify which intent they are interested in from the list below.\n"
                "If the query doesn't match any intent precisely, return null for intent_id.\n"
                "Return only JSON with intent_id and intent_name.\n\n"
                "Available Intents:\n{intent_descriptions}\n\n"
                "Query: {query}"
            )

            chain = prompt | self.llm
            try:
                result = await chain.ainvoke({
                    "query": query,
                    "intent_descriptions": intent_descriptions
                })
                parsed = self._parse_json(result.content)
                return {
                    "intent_id": parsed.get("intent_id"),
                    "intent_name": parsed.get("intent_name") or "Unknown"
                }
            except Exception as e:
                print(f"AI Intent Parsing Error (likely quota): {e}")

        return {"intent_id": None, "intent_name": "Unknown"}

    async def get_chat_response(self, db: Session, message: str, context: str = ""):
        intents = self._get_available_intents(db)
        intent_list = ", ".join([i['name'] for i in intents])

        # 1. Try OpenAI
        if self.llm:
            prompt = ChatPromptTemplate.from_template(
                "You are Saarthi AI (सारथी), an expert guide for Indian citizens. You help them navigate government services, licenses, and schemes.\n"
                "Your tone is professional, helpful, and empathetic. Use a mix of English and Hindi/Telugu terms if appropriate (e.g., 'Namaste', 'Saarthi').\n\n"
                "Context of available roadmaps we can generate: {intent_list}\n"
                "Additional Context: {context}\n\n"
                "Citizen: {message}\n"
                "Saarthi AI:"
            )

            chain = prompt | self.llm
            try:
                result = await chain.ainvoke({
                    "message": message,
                    "context": context,
                    "intent_list": intent_list
                })
                return result.content
            except Exception as e:
                print(f"AI Chat Error (likely quota): {e}")

        # 2. Fallback Response (Non-AI)
        return f"Namaste! I am your Saarthi. I can guide you through services like {intent_list}. Please type your goal clearly, and I will build a roadmap for you."

    async def generate_roadmap(self, db: Session, message: str):
        # Try Gemini first
        if self.gemini_model:
            intents = self._get_available_intents(db)
            intent_descriptions = "\n".join([f"- {i['name']}: {i['description']}" for i in intents])
            prompt = f"""
You are Saarthi AI, an expert Telangana government services navigator.
Generate a citizen-specific roadmap for the citizen goal below.

Citizen goal: {message}

Available known service categories:
{intent_descriptions}

Return ONLY valid JSON. No markdown. No explanations outside JSON.
Use this exact schema:
{{
  "intent": "short intent name",
  "location": "city/state if known, otherwise Telangana",
  "title": "roadmap title",
  "timeline": "number range only, e.g. 15-20",
  "fastestPath": "one sentence action plan",
  "teluguHint": "one simple Telugu guidance sentence",
  "schemes": ["scheme 1", "scheme 2"],
  "steps": [
    {{
      "id": 1,
      "title": "approval or service name",
      "dept": "government department",
      "status": "Ready|Pending|Blocked by Step 1|Optional",
      "days": "2-4 days",
      "documents": ["document 1", "document 2"]
    }}
  ],
  "response": "short citizen-facing answer explaining what was generated"
}}

Rules:
- Prefer Telangana departments when location is Telangana or Hyderabad.
- For food/shop/business goals include Labour Department, GHMC/municipality, FSSAI if relevant.
- Include documents that can later fill forms: Aadhaar, PAN, address proof, photos, agreements, certificates.
- Keep timeline as a number range string only.
- Do not claim online submission to a government portal unless generally available.
"""
            try:
                result = await asyncio.to_thread(self.gemini_model.generate_content, prompt)
                text = result.text or ""
                data = self._parse_json(text)
                return self._normalize_roadmap(data, message)
            except Exception as exc:
                print(f"Gemini Roadmap Error: {exc}")

        # Build roadmap from database workflow engine
        return await self._build_roadmap_from_db(db, message)

    async def _build_roadmap_from_db(self, db: Session, message: str, user_profile=None):
        # Find best matching intent from database
        intents = db.query(models.Intent).all()
        best_match = None
        best_score = 0
        message_lower = message.lower()

        for intent in intents:
            score = 0
            name_words = intent.name.lower().split()
            for word in name_words:
                if len(word) > 3 and word in message_lower:
                    score += 2
            if intent.trigger_keywords:
                for kw in intent.trigger_keywords:
                    if kw.lower() in message_lower:
                        score += 3
            if intent.description:
                desc_words = intent.description.lower().split()
                for word in desc_words:
                    if len(word) > 4 and word in message_lower:
                        score += 1
            if score > best_score:
                best_score = score
                best_match = intent

        if not best_match:
            # If no match, try to find one that is "general" or use the first one
            best_match = db.query(models.Intent).filter(models.Intent.name.ilike("%general%")).first() or (intents[0] if intents else None)

        if not best_match:
            return self._hardcoded_fallback(message)

        # Get schemes for this intent with scoring
        schemes = self._get_schemes_for_intent(db, best_match, user_profile)

        # Build roadmap from database workflow
        intent_services = db.query(models.IntentService).filter(
            models.IntentService.intent_id == best_match.id
        ).order_by(models.IntentService.step_order).all()

        steps = []
        total_days = 0
        
        # If intent has a stored roadmap template and no services mapped, use template steps
        if best_match.roadmap_template and not intent_services:
            template_steps = best_match.roadmap_template.get("steps", [])
            for idx, ts in enumerate(template_steps):
                steps.append({
                    "id": idx + 1,
                    "title": ts.get("title", "Step"),
                    "dept": ts.get("dept", "Department"),
                    "status": ts.get("status", "Ready" if idx == 0 else "Pending"),
                    "days": ts.get("days", "3-7 days"),
                    "documents": ts.get("documents", ["Aadhaar", "Address proof"])
                })
        else:
            for idx, isvc in enumerate(intent_services):
                svc = db.query(models.Service).filter(models.Service.id == isvc.service_id).first()
                if not svc:
                    continue
                deps = db.query(models.ServiceDependency).filter(
                    models.ServiceDependency.service_id == svc.id
                ).all()
                dep_ids = [d.requires_service_id for d in deps]

                if idx == 0:
                    status = "Ready"
                elif dep_ids:
                    status = f"Blocked by Step {idx}"
                else:
                    status = "Pending"

                steps.append({
                    "id": idx + 1,
                    "title": svc.name,
                    "dept": svc.department,
                    "status": status,
                    "days": f"{max(1, svc.sla_days // 2)}-{svc.sla_days} days",
                    "documents": self._get_documents_for_service(svc.name)
                })
                total_days += svc.sla_days

        # Detect location
        location = "Telangana"
        if "hyderabad" in message_lower:
            location = "Hyderabad, Telangana"
        elif "delhi" in message_lower:
            location = "Delhi"
        elif "mumbai" in message_lower or "maharashtra" in message_lower:
            location = "Maharashtra"
        elif "bangalore" in message_lower or "karnataka" in message_lower:
            location = "Karnataka"

        timeline_min = max(5, total_days // 2) if total_days > 0 else 7
        timeline_max = total_days + 5 if total_days > 0 else 15

        title = f"{best_match.name} Roadmap"
        if best_match.roadmap_template:
            title = best_match.roadmap_template.get("title", title)

        return self._normalize_roadmap({
            "intent": best_match.name,
            "location": location,
            "title": f"{title} for {location}",
            "timeline": f"{timeline_min}-{timeline_max}",
            "fastestPath": f"Upload Aadhaar and required documents first, then start {steps[0]['title'] if steps else 'Step 1'}.",
            "teluguHint": f"ముందుగా అవసరమైన పత్రాలు సిద్ధం చేయండి. {best_match.name} కోసం దరఖాస్తు ప్రారంభించండి.",
            "schemes": schemes,
            "steps": steps,
            "response": f"I've identified your goal as '{best_match.name}'. I have generated a {len(steps)}-step government service roadmap for {location} to help you achieve this."
        }, message)

    def _get_documents_for_service(self, service_name: str):
        doc_map = {
            "Shop & Establishment": ["Aadhaar", "PAN", "Shop address proof", "Passport photos"],
            "Trade License": ["Rental agreement", "Photos", "NOC if applicable", "Aadhaar"],
            "FSSAI Registration": ["Food business details", "ID proof", "Applicant photo", "Layout plan"],
            "Birth Registration": ["Hospital discharge summary", "Parent Aadhaar", "Address proof"],
            "Marriage License": ["Aadhaar", "Age proof", "Photos", "Witness IDs", "Address proof"],
            "Stamp Duty Payment": ["Sale deed", "Property documents", "PAN", "Aadhaar"],
            "Property Deed Registration": ["Stamp duty receipt", "Sale deed", "Photos", "ID proof"],
            "Udyam Registration": ["Aadhaar", "PAN", "Business address proof", "Bank details"],
            "Community Verification": ["Aadhaar", "Caste proof", "Parent certificates", "Photos"],
            "Income Verification": ["Aadhaar", "Income proof", "Bank statements", "Salary slip or affidavit"],
            "Learner License Slot": ["Aadhaar", "PAN", "Photos", "Medical certificate"],
            "Voter Form 8 Submission": ["Aadhaar", "Old voter ID", "Address proof", "Photos"],
            "PAN Application": ["Aadhaar", "Photos", "Signature"],
            "Passport Application": ["Aadhaar", "PAN", "Birth certificate", "Address proof", "Photos"],
            "Police Verification": ["Aadhaar", "Address proof", "Character certificate"],
            "Pollution NOC": ["Factory layout", "Process flow", "Consent application", "Aadhaar"],
            "Fire NOC": ["Building plan", "NOC application", "Safety certificates", "Aadhaar"],
            "Building Plan Approval": ["Land documents", "Building plan", "NOC applications", "Aadhaar"],
            "Ration Card Application": ["Aadhaar", "Address proof", "Income certificate", "Family photo"],
            "Senior Citizen Certificate": ["Aadhaar", "Age proof", "Photos", "Address proof"],
        }
        return doc_map.get(service_name, ["Aadhaar", "Address proof", "Photos"])

    def _get_schemes_for_intent(self, db: Session, intent, user_profile=None):
        schemes = db.query(models.Scheme).all()
        intent_name_lower = intent.name.lower()
        matched = []

        keyword_map = {
            "tea shop": ["vendor", "business", "self-employed"],
            "food": ["vendor", "business", "fssai"],
            "birth": ["general", "citizen"],
            "farm": ["farmer", "agriculture"],
            "marriage": ["general", "social"],
            "property": ["general", "urban"],
            "msme": ["business", "enterprise"],
            "caste": ["sc_st", "reservation"],
            "income": ["bpl", "economic"],
            "driving": ["general", "transport"],
            "voter": ["general", "election"],
            "pan": ["general", "tax"],
            "passport": ["general", "travel"],
            "trade": ["vendor", "business"],
            "pollution": ["business", "industry"],
            "fire": ["business", "safety"],
            "building": ["business", "urban"],
            "ration": ["bpl", "food-security"],
            "senior": ["senior", "elderly"],
        }

        target_categories = ["general"]
        for key, cats in keyword_map.items():
            if key in intent_name_lower:
                target_categories = cats
                break

        for scheme in schemes:
            rules = scheme.eligibility_rules or {}
            cat = rules.get("category", "general")
            
            # Calculate match score
            score = 0
            if cat in target_categories or cat == "all":
                score += 70
            
            # Bonus for specific profile matches
            if user_profile:
                if rules.get("citizen_type") == user_profile.citizen_type:
                    score += 20
                if rules.get("district") == user_profile.district:
                    score += 5
                if rules.get("location") == user_profile.location:
                    score += 5
            else:
                # Default high score for general schemes if no profile
                if cat == "general":
                    score += 15

            # Randomize slightly for "AI" feel
            import random
            score = min(98, score + random.randint(0, 5))

            if score > 40:
                matched.append({
                    "name": scheme.name,
                    "description": scheme.description or "Government benefit scheme",
                    "match_score": score,
                    "benefit": rules.get("benefit", "Financial assistance / Support")
                })

        # Sort by match score
        matched.sort(key=lambda x: x["match_score"], reverse=True)
        return matched[:5] if matched else [
            {"name": "PM Jan Dhan Yojana", "description": "Financial inclusion", "match_score": 85, "benefit": "Bank account & Insurance"},
            {"name": "PM Suraksha Bima", "description": "Accident insurance", "match_score": 82, "benefit": "Rs. 2 Lakh cover"}
        ]

    def _hardcoded_fallback(self, message: str):
        return self._normalize_roadmap({
            "intent": "Government service request",
            "location": "Telangana",
            "title": "Government service roadmap",
            "timeline": "7-15",
            "fastestPath": "Upload required documents first, then start the first available approval.",
            "teluguHint": "ముందుగా అవసరమైన పత్రాలు సిద్ధం చేయండి.",
            "schemes": ["PM Jan Dhan Yojana"],
            "steps": [
                {"id": 1, "title": "Service eligibility check", "dept": "MeeSeva / Relevant department", "status": "Ready", "days": "1-3 days", "documents": ["Aadhaar", "Address proof"]},
                {"id": 2, "title": "Document verification", "dept": "Relevant department", "status": "Pending", "days": "3-7 days", "documents": ["Supporting documents"]},
            ],
            "response": "I've identified your goal. Here is your personalized government service roadmap."
        }, message)

    def _parse_json(self, text: str):
        cleaned = text.strip()
        cleaned = re.sub(r"^```json\s*", "", cleaned)
        cleaned = re.sub(r"^```\s*", "", cleaned)
        cleaned = re.sub(r"\s*```$", "", cleaned)
        try:
            return json.loads(cleaned)
        except json.JSONDecodeError:
            match = re.search(r"\{.*\}", cleaned, re.DOTALL)
            if not match:
                raise
            return json.loads(match.group(0))

    def _normalize_roadmap(self, data: dict, goal: str):
        steps = data.get("steps") or []
        normalized_steps = []
        for index, step in enumerate(steps[:8], start=1):
            normalized_steps.append({
                "id": int(step.get("id") or index),
                "title": str(step.get("title") or "Government service step"),
                "dept": str(step.get("dept") or "Relevant department"),
                "status": str(step.get("status") or ("Ready" if index == 1 else "Pending")),
                "days": str(step.get("days") or "3-7 days"),
                "documents": [str(doc) for doc in (step.get("documents") or ["Aadhaar", "Address proof"])]
            })

        if not normalized_steps:
            normalized_steps = [{
                "id": 1,
                "title": "Service eligibility and document check",
                "dept": "MeeSeva / Relevant department",
                "status": "Ready",
                "days": "1-3 days",
                "documents": ["Aadhaar", "Address proof"]
            }]

        # Normalize schemes to list of dicts with match scores
        raw_schemes = data.get("schemes") or []
        normalized_schemes = []
        for s in raw_schemes:
            if isinstance(s, dict):
                normalized_schemes.append({
                    "name": str(s.get("name", "Scheme")),
                    "match_score": int(s.get("match_score", 80)),
                    "description": str(s.get("description", "Government scheme")),
                    "benefit": str(s.get("benefit", "Social support"))
                })
            else:
                normalized_schemes.append({
                    "name": str(s),
                    "match_score": 80,
                    "description": "Government scheme",
                    "benefit": "Social support"
                })

        return {
            "goal": goal,
            "intent": str(data.get("intent") or "Government service request"),
            "location": str(data.get("location") or "Telangana"),
            "title": str(data.get("title") or "Personalized government service roadmap"),
            "timeline": str(data.get("timeline") or "7-15"),
            "fastestPath": str(data.get("fastestPath") or "Upload required documents first, then start the first available approval."),
            "teluguHint": str(data.get("teluguHint") or "ముందుగా అవసరమైన పత్రాలు సిద్ధం చేయండి."),
            "schemes": normalized_schemes,
            "steps": normalized_steps,
            "response": str(data.get("response") or "I generated a personalized roadmap for your goal.")
        }

ai_service = AIService()
