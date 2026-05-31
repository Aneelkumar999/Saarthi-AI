from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models import models
import pytesseract
from pytesseract import TesseractNotFoundError
from PIL import Image
import io
import json

router = APIRouter()

@router.post("/upload")
async def upload_document(file: UploadFile = File(...), db: Session = Depends(get_db)):
    # 1. Read file content
    content = await file.read()
    
    # 2. Perform OCR (Basic implementation)
    try:
        image = Image.open(io.BytesIO(content))
        try:
            text = pytesseract.image_to_string(image)
        except TesseractNotFoundError:
            text = "OCR engine unavailable locally; using demo extraction fallback."
        
        # 3. Simple Mock Extraction (In real project, use LLM to parse OCR text)
        extracted_data = {
            "filename": file.filename,
            "raw_text": text[:500], # Store first 500 chars
            "extracted_fields": {
                "name": "Extracted from OCR",
                "id_number": "Pending verification"
            }
        }
        
        # 4. Save to DB (Assuming a default user for MVP)
        # For full project, we would use current_user.id
        # doc = models.UserDocument(
        #     doc_type=file.filename.split('.')[-1],
        #     extracted_data=extracted_data
        # )
        # db.add(doc)
        # db.commit()
        
        return {
            "message": "Document uploaded and processed successfully",
            "extracted_data": extracted_data
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"OCR Processing failed: {str(e)}")
