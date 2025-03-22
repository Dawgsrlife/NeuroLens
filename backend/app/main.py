import asyncio
import base64
import cv2
import numpy as np
import os
import json
from fastapi import FastAPI, WebSocket, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import uvicorn
from openai import AsyncOpenAI
from agents import (
    Agent, 
    Runner, 
    function_tool, 
    RunContextWrapper, 
    trace,
    set_default_openai_key
)

# Set up the OpenAI API key - in production, use environment variables
set_default_openai_key(os.environ.get("OPENAI_API_KEY"))
client = AsyncOpenAI()

app = FastAPI()

# Configure CORS to allow requests from the Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define models for request/response data
class ImageRequest(BaseModel):
    image: str  # Base64 encoded image
    prompt: str  # User's voice command or question

class TextToSpeechRequest(BaseModel):
    text: str

class SessionState:
    def __init__(self):
        self.recent_images = []  # Store recent images for context
        self.conversation_history = []  # Store conversation history

# Global session state
session_state = SessionState()

# Function to process images and extract visual information
@function_tool
async def analyze_image(ctx: RunContextWrapper, image_data: str) -> str:
    """
    Analyze the image and extract visual information.
    
    Args:
        image_data: Base64 encoded image data
    
    Returns:
        Description of what is in the image
    """
    try:
        # Use OpenAI's vision model to analyze the image
        response = await client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {
                    "role": "system",
                    "content": "You are a helpful assistant for visually impaired users. Describe images clearly and concisely, focusing on important details. If you see text like labels, signs, or numbers, make sure to read it out clearly. If you see a payment card, identify the bank if possible and read visible numbers, but be mindful of privacy."
                },
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": "What's in this image? Provide a detailed description for a visually impaired person."},
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/jpeg;base64,{image_data}"
                            }
                        }
                    ]
                }
            ],
            max_tokens=500
        )
        return response.choices[0].message.content
    except Exception as e:
        return f"Error analyzing image: {str(e)}"

@function_tool
async def detect_objects(ctx: RunContextWrapper, image_data: str) -> str:
    """
    Detect specific objects in the image.
    
    Args:
        image_data: Base64 encoded image data
    
    Returns:
        List of objects detected in the image
    """
    try:
        # Use OpenAI's vision model to detect objects
        response = await client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {
                    "role": "system",
                    "content": "Identify the main objects in the image. List them in order of prominence."
                },
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": "What objects do you see in this image? List only the main items."},
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/jpeg;base64,{image_data}"
                            }
                        }
                    ]
                }
            ],
            max_tokens=250
        )
        return response.choices[0].message.content
    except Exception as e:
        return f"Error detecting objects: {str(e)}"

@function_tool
async def read_text(ctx: RunContextWrapper, image_data: str) -> str:
    """
    Read text visible in the image.
    
    Args:
        image_data: Base64 encoded image data
    
    Returns:
        Text found in the image
    """
    try:
        # Use OpenAI's vision model to read text
        response = await client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {
                    "role": "system",
                    "content": "You specialize in reading text from images. Extract and present all visible text clearly. For payment cards, identify the bank if possible, and include visible card numbers."
                },
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": "Read all text visible in this image."},
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/jpeg;base64,{image_data}"
                            }
                        }
                    ]
                }
            ],
            max_tokens=250
        )
        return response.choices[0].message.content
    except Exception as e:
        return f"Error reading text: {str(e)}"

# Create the agent that will handle user interactions
vision_assistant = Agent(
    name="Vision Companion",
    instructions="""
    You are Vision Companion, an assistant designed to help visually impaired users navigate and understand their environment.
    
    When users ask about what they're seeing, use the analyze_image tool to provide detailed descriptions.
    When users ask about specific objects, use the detect_objects tool.
    When users need text to be read, use the read_text tool.
    
    Always be concise, clear, and helpful. Describe things in a way that creates a mental image for someone who cannot see.
    If you see payment cards, identify the bank and visible numbers, but be mindful of privacy.
    
    Always prioritize the user's safety. If you detect potential hazards, communicate them clearly.
    """,
    tools=[analyze_image, detect_objects, read_text],
)

@app.post("/process-image")
async def process_image(request: ImageRequest):
    """
    Process an image with a text prompt and return the assistant's response.
    """
    try:
        image_data = request.image
        if image_data.startswith("data:image"):
            # Strip the data URL prefix if present
            image_data = image_data.split(",")[1]
        
        # Store the image in session state
        session_state.recent_images.append(image_data)
        
        # Use the agent to process the image and prompt
        with trace(workflow_name="Vision Companion"):
            result = await Runner.run(
                vision_assistant,
                f"The user said: '{request.prompt}'. Please analyze the image to help them.",
                context={"image_data": image_data}
            )
        
        # Store the conversation in history
        session_state.conversation_history.append({
            "role": "user",
            "content": request.prompt
        })
        session_state.conversation_history.append({
            "role": "assistant",
            "content": result.final_output
        })
        
        return {"response": result.final_output}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing image: {str(e)}")

@app.post("/text-to-speech")
async def text_to_speech(request: TextToSpeechRequest):
    """
    Convert text to speech audio using OpenAI's TTS model.
    """
    try:
        response = await client.audio.speech.create(
            model="gpt-4o-mini-tts",
            voice="echo",
            input=request.text,
            speed=1.0
        )
        
        # Convert the speech data to base64 for sending to the frontend
        speech_data = base64.b64encode(await response.read()).decode("utf-8")
        return {"audio": speech_data}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating speech: {str(e)}")

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """
    WebSocket endpoint for real-time audio/video processing.
    """
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_text()
            data_json = json.loads(data)
            
            if data_json.get("type") == "image":
                image_data = data_json.get("data")
                prompt = data_json.get("prompt", "What am I looking at?")
                
                # Process the image with the agent
                with trace(workflow_name="Vision Companion"):
                    result = await Runner.run(
                        vision_assistant,
                        f"The user said: '{prompt}'. Please analyze the image to help them.",
                        context={"image_data": image_data}
                    )
                
                # Generate speech from the response
                response = await client.audio.speech.create(
                    model="gpt-4o-mini-tts",
                    voice="echo",
                    input=result.final_output,
                    speed=1.0
                )
                
                # Convert the speech data to base64 for sending to the frontend
                speech_data = base64.b64encode(await response.read()).decode("utf-8")
                
                # Send the response back to the client
                await websocket.send_json({
                    "type": "response",
                    "text": result.final_output,
                    "audio": speech_data
                })
            
            elif data_json.get("type") == "audio":
                # Here you would handle audio input from the user
                # This would involve speech-to-text processing
                # For now, we'll just acknowledge receipt
                await websocket.send_json({
                    "type": "acknowledge",
                    "message": "Audio received"
                })
    
    except Exception as e:
        await websocket.close()
        print(f"WebSocket error: {str(e)}")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)