from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from fastapi.responses import StreamingResponse, JSONResponse
from typing import List, Optional, Dict, Any
import json
import io

from app.models.schemas import UserSettings, ProcessedFrame
from app.services.vision_service import VisionService
from app.services.speech_service import SpeechService
from app.services.agent_service import AgentService

router = APIRouter()

# Initialize services
vision_service = VisionService()
speech_service = SpeechService()
agent_service = AgentService()

@router.post("/settings", response_model=Dict[str, Any])
async def update_settings(settings: UserSettings):
    """Update user settings"""
    # In a real implementation, you'd store these settings in a database
    # For this simple example, we'll just return the settings back
    return {"status": "success", "settings": settings.dict()}

@router.post("/analyze-image", response_model=ProcessedFrame)
async def analyze_image(
    file: UploadFile = File(...),
    query: Optional[str] = Form(None)
):
    """
    Analyze an uploaded image and optionally answer a query about it
    """
    try:
        # Read the image data
        image_data = await file.read()
        
        # Process the image
        processed_frame = await vision_service.process_frame(image_data)
        
        # If a query was provided, process it with the agent
        if query:
            response, voice_feedback = await agent_service.process_query(query, processed_frame)
            processed_frame.voiceFeedback = voice_feedback
        
        return processed_frame
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing image: {str(e)}"
        )

@router.post("/text-to-speech", response_class=StreamingResponse)
async def text_to_speech(data: Dict[str, str]):
    """
    Convert text to speech
    """
    try:
        text = data.get("text", "")
        if not text:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Text is required"
            )
        
        # Generate speech
        audio_data = await speech_service.text_to_speech(text)
        
        # Return the audio as a streaming response
        return StreamingResponse(
            io.BytesIO(audio_data),
            media_type="audio/mp3"
        )
    
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating speech: {str(e)}"
        )

@router.post("/ask", response_model=Dict[str, Any])
async def ask_question(data: Dict[str, Any]):
    """
    Ask a question and get a response
    """
    try:
        question = data.get("question", "")
        image_data = data.get("image_data", None)
        
        if not question:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Question is required"
            )
        
        # If image data was provided, process it
        if image_data:
            # Decode base64 image data
            import base64
            image_bytes = base64.b64decode(image_data.split(",")[1] if "," in image_data else image_data)
            processed_frame = await vision_service.process_frame(image_bytes)
        else:
            # Create an empty frame
            processed_frame = ProcessedFrame(captions=[], frame_id="no-image")
        
        # Process the question
        response, voice_feedback = await agent_service.process_query(question, processed_frame)
        
        # Generate speech
        audio_data = await speech_service.text_to_speech(response)
        audio_base64 = base64.b64encode(audio_data).decode("utf-8")
        
        return {
            "text_response": response,
            "audio_response": f"data:audio/mp3;base64,{audio_base64}",
            "processed_frame": processed_frame.dict()
        }
    
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing question: {str(e)}"
        )