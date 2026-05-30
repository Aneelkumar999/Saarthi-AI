import os
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_classic.output_parsers import ResponseSchema, StructuredOutputParser
from dotenv import load_dotenv
from sqlalchemy.orm import Session
from app.models import models

load_dotenv()

class AIService:
    def __init__(self):
        self.api_key = os.getenv("OPENAI_API_KEY")
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

ai_service = AIService()
