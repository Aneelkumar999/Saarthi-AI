import os
<<<<<<< HEAD
import asyncio
import json
import re
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
=======
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_classic.output_parsers import ResponseSchema, StructuredOutputParser
>>>>>>> origin/main
from dotenv import load_dotenv
from sqlalchemy.orm import Session
from app.models import models

<<<<<<< HEAD
try:
    import google.generativeai as genai
except ImportError:
    genai = None

=======
>>>>>>> origin/main
load_dotenv()

class AIService:
    def __init__(self):
        self.api_key = os.getenv("OPENAI_API_KEY")
<<<<<<< HEAD
        self.gemini_api_key = os.getenv("GEMINI_API_KEY")
        self.gemini_model = None
        if genai and self.gemini_api_key:
            genai.configure(api_key=self.gemini_api_key)
            self.gemini_model = genai.GenerativeModel(os.getenv("GEMINI_MODEL", "gemini-2.0-flash"))
=======
>>>>>>> origin/main
        if self.api_key and self.api_key != "your_openai_api_key_here":
            self.llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.7)
        else:
            self.llm = None

    def _get_available_intents(self, db: Session):
        intents = db.query(models.Intent).all()
        return [{"id": i.id, "name": i.name, "description": i.description} for i in intents]

    async def parse_intent(self, db: Session, query: str):
        intents = self._get_available_intents(db)
        
        # 1. Try Keyword Matching First (Fast & Free)
        query_lower = query.lower()
        for i in intents:
            name_words = i['name'].lower().split()
            # If any significant word from intent name is in query
            # e.g. "Marriage" in "I want to get married"
            for word in name_words:
                if len(word) > 3 and word in query_lower:
                    return {"intent_id": i['id'], "intent_name": i['name']}
            
<<<<<<< HEAD
=======
        # 2. Try OpenAI if available
        if self.llm:
            intent_descriptions = "\n".join([f"- ID {i['id']}: {i['name']} ({i['description']})" for i in intents])

            response_schemas = [
                ResponseSchema(name="intent_id", description="The ID of the identified intent from the provided list, or null if no match found."),
                ResponseSchema(name="intent_name", description="The name of the identified intent.")
            ]
            output_parser = StructuredOutputParser.from_response_schemas(response_schemas)
            format_instructions = output_parser.get_format_instructions()

            prompt = ChatPromptTemplate.from_template(
                "You are a government service assistant. Parse the citizen query and identify which intent they are interested in from the list below.\n"
                "If the query doesn't match any intent precisely, return null for intent_id.\n\n"
                "Available Intents:\n{intent_descriptions}\n\n"
                "{format_instructions}\n"
                "Query: {query}"
            )

            chain = prompt | self.llm | output_parser
            try:
                result = await chain.ainvoke({
                    "query": query, 
                    "intent_descriptions": intent_descriptions,
                    "format_instructions": format_instructions
                })
                return result
            except Exception as e:
                print(f"AI Intent Parsing Error (likely quota): {e}")
        
>>>>>>> origin/main
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

<<<<<<< HEAD
    async def generate_roadmap(self, db: Session, message: str):
        if not self.gemini_model:
            return None

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
            return None

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

        return {
            "goal": goal,
            "intent": str(data.get("intent") or "Government service request"),
            "location": str(data.get("location") or "Telangana"),
            "title": str(data.get("title") or "Personalized government service roadmap"),
            "timeline": str(data.get("timeline") or "7-15"),
            "fastestPath": str(data.get("fastestPath") or "Upload required documents first, then start the first available approval."),
            "teluguHint": str(data.get("teluguHint") or "ముందుగా అవసరమైన పత్రాలు సిద్ధం చేయండి."),
            "schemes": [str(scheme) for scheme in (data.get("schemes") or [])],
            "steps": normalized_steps,
            "response": str(data.get("response") or "I generated a personalized roadmap for your goal.")
        }

=======
>>>>>>> origin/main
ai_service = AIService()
