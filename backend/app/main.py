from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.endpoints import router as api_router
from app.api.documents import router as docs_router
from app.api.forms import router as forms_router
from app.core.init_db import init_db

app = FastAPI(title="Saarthi AI API")

@app.on_event("startup")
def on_startup():
    init_db()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/v1")
app.include_router(docs_router, prefix="/api/v1/documents")
app.include_router(forms_router, prefix="/api/v1/forms")

@app.get("/")
async def root():
    return {"message": "Welcome to Saarthi AI API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
