from fastapi import APIRouter, UploadFile, File
from app.services import llm_service, cv_service

router = APIRouter()

@router.post("/describe-image")
async def describe_image(file: UploadFile = File(...)):
    result = await cv_service.process_image(file)
    return {"description": result}

@router.post("/ask-ai")
async def ask_ai(prompt: str):
    response = llm_service.query_llm(prompt)
    return {"response": response}
