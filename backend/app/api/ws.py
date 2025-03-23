import asyncio
import json
import logging
import uuid
import time
from typing import Dict, List, Optional, Any, Callable
import base64
from starlette.websockets import WebSocketState
from datetime import datetime

from fastapi import WebSocket, WebSocketDisconnect, Depends, status
from pydantic import ValidationError

from app.models.schemas import ProcessedFrame, Caption, CaptionType, CaptionPriority, VoiceFeedback
from app.services.vision_service import VisionService
from app.services.speech_service import SpeechService
from app.services.agent_service import AgentService
from app.services.memory_service import MemoryService

logger = logging.getLogger(__name__)

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
        self.vision_service = VisionService()
        self.speech_service = SpeechService()
        self.agent_service = AgentService()
        self.memory_service = MemoryService()
        
        # Mapping of connection ID to processing task
        self.tasks: Dict[str, asyncio.Task] = {}
    
    async def connect(self, websocket: WebSocket) -> str:
        """
        Accept a new WebSocket connection and return a connection ID
        """
        await websocket.accept()
        connection_id = str(uuid.uuid4())
        self.active_connections[connection_id] = websocket
        return connection_id
    
    async def disconnect(self, connection_id: str) -> None:
        """
        Remove a WebSocket connection and cancel any associated tasks
        """
        if connection_id in self.active_connections:
            del self.active_connections[connection_id]
        
        # Cancel any running task for this connection
        if connection_id in self.tasks:
            self.tasks[connection_id].cancel()
            del self.tasks[connection_id]
    
    async def send_message(self, connection_id: str, message: dict) -> None:
        """Send a message to a specific client"""
        if connection_id in self.active_connections:
            try:
                websocket = self.active_connections[connection_id]
                # Check if the connection is still open
                if websocket.client_state == WebSocketState.CONNECTED:
                    await websocket.send_json(message)
                else:
                    logger.warning(f"Connection {connection_id} no longer connected")
                    await self.disconnect(connection_id)
            except RuntimeError as e:
                if "close message" in str(e):
                    logger.warning(f"Connection {connection_id} already closed, removing")
                    await self.disconnect(connection_id)
                else:
                    logger.error(f"RuntimeError when sending message: {str(e)}")
            except Exception as e:
                logger.error(f"Error sending message: {str(e)}")
                await self.disconnect(connection_id)
    
    async def broadcast(self, message: dict) -> None:
        """
        Broadcast a message to all connected clients
        """
        disconnected = []
        for connection_id, connection in self.active_connections.items():
            try:
                await connection.send_json(message)
            except Exception:
                disconnected.append(connection_id)
        
        # Clean up any disconnected clients
        for connection_id in disconnected:
            await self.disconnect(connection_id)
    
    async def process_video_frame(self, connection_id: str, frame_data: bytes) -> None:
        """
        Process a video frame from the client
        """
        try:
            # Process the frame with the vision service
            processed_frame = await self.vision_service.process_frame(frame_data)
            
            # Update the memory with detected objects and texts
            if processed_frame.detected_objects:
                self.memory_service.add_detected_objects(processed_frame.detected_objects)
            
            if processed_frame.detected_texts:
                self.memory_service.add_detected_texts(processed_frame.detected_texts)
            
            if processed_frame.raw_description:
                self.memory_service.add_scene_description(processed_frame.raw_description)
            
            # Normalize the response to match the frontend's expected structure
            normalized_frame = {
                "captions": [caption.model_dump() for caption in processed_frame.captions],
                "voiceFeedback": processed_frame.voiceFeedback.model_dump() if processed_frame.voiceFeedback else None,
                "objects": processed_frame.objects  # This already contains name, distance, direction
            }
            
            # Send the normalized frame back to the client
            await self.send_message(connection_id, normalized_frame)
        
        except Exception as e:
            logger.error(f"Error processing video frame: {str(e)}", exc_info=True)
            error_message = {
                "error": f"Error processing video frame: {str(e)}"
            }
            await self.send_message(connection_id, error_message)
    
    async def process_audio(self, connection_id: str, audio_data: bytes) -> None:
        """
        Process audio from the client
        """
        try:
            # Transcribe the audio
            transcription = await self.speech_service.transcribe_audio(audio_data)
            
            if not transcription:
                logger.warning("No transcription produced")
                return
            
            logger.info(f"Transcribed: {transcription}")
            
            # Get the latest frame for context
            current_frame = ProcessedFrame(
                captions=[],
                frame_id=str(uuid.uuid4())
            )
            
            # Process the query with the agent
            try:
                response, voice_feedback = await self.agent_service.process_query(
                    transcription, 
                    current_frame
                )
                
                # Create timestamp for response
                timestamp = datetime.now().timestamp()
                
                # Send the response text back to the client with the expected structure
                response_message = {
                    "captions": [
                        {
                            "id": str(uuid.uuid4()),
                            "text": transcription,
                            "type": "audio",
                            "priority": "medium",
                            "timestamp": timestamp
                        }
                    ],
                    "voiceFeedback": voice_feedback.model_dump() if voice_feedback and hasattr(voice_feedback, 'model_dump') else {
                        "text": str(response),
                        "priority": "medium",
                        "timestamp": timestamp
                    },
                    "objects": []  # Include empty objects array to match expected structure
                }
                
                await self.send_message(connection_id, response_message)
                
            except Exception as e:
                logger.error(f"Error processing query: {str(e)}", exc_info=True)
                # Send a fallback response with the expected structure
                timestamp = datetime.now().timestamp()
                error_message = {
                    "captions": [
                        {
                            "id": str(uuid.uuid4()),
                            "text": transcription, 
                            "type": "audio",
                            "priority": "medium",
                            "timestamp": timestamp
                        }
                    ],
                    "voiceFeedback": {
                        "text": f"I heard you say '{transcription}', but I'm having trouble processing your request right now. Please try again in a moment.",
                        "priority": "high",
                        "timestamp": timestamp
                    },
                    "objects": []  # Include empty objects array to match expected structure
                }
                await self.send_message(connection_id, error_message)
                
        except Exception as e:
            logger.error(f"Error processing audio: {str(e)}")
            error_message = {
                "error": f"Error processing audio: {str(e)}"
            }
            try:
                await self.send_message(connection_id, error_message)
            except Exception as send_error:
                logger.error(f"Error sending error message: {str(send_error)}")
    
    async def handle_user_message(self, connection_id: str, message: str) -> None:
        """
        Handle a user message from the client
        """
        try:
            # Process the message with the agent
            current_frame = ProcessedFrame(
                captions=[],
                frame_id=str(uuid.uuid4())
            )
            
            response, voice_feedback = await self.agent_service.process_query(
                message, 
                current_frame
            )
            
            # Send the response text back to the client
            response_message = {
                "captions": [
                    {
                        "id": str(uuid.uuid4()),
                        "text": message,
                        "type": "audio",
                        "priority": "medium",
                        "timestamp": voice_feedback.timestamp
                    }
                ],
                "voiceFeedback": voice_feedback.model_dump() if voice_feedback else None
            }
            
            await self.send_message(connection_id, response_message)
            
            # Generate and stream speech response
            speech_data = await self.speech_service.text_to_speech(response)
            logger.info(f"Generated {len(speech_data)} bytes of speech data")
            
        except Exception as e:
            logger.error(f"Error handling user message: {str(e)}")
            error_message = {
                "error": f"Error handling user message: {str(e)}"
            }
            await self.send_message(connection_id, error_message)

# Initialize the connection manager
connection_manager = ConnectionManager()

async def websocket_endpoint(websocket: WebSocket):
    """
    WebSocket endpoint for real-time communication
    """
    connection_id = await connection_manager.connect(websocket)
    
    try:
        logger.info(f"New WebSocket connection established: {connection_id}")
        
        # Send a welcome message - make sure it matches the expected frontend structure
        welcome_message = {
            "captions": [
                {
                    "id": str(uuid.uuid4()),
                    "text": "Connected to NeuroLens. Ready to assist you!",
                    "type": "visual",
                    "priority": "high",
                    "timestamp": datetime.now().timestamp()
                }
            ],
            "voiceFeedback": None,
            "objects": []  # Empty objects array to match expected structure
        }
        await connection_manager.send_message(connection_id, welcome_message)
        
        # Process incoming messages
        while True:
            # Wait for the next message
            message = await websocket.receive()
            
            # Check the message type
            if "text" in message:
                # Process text message as JSON
                try:
                    data = json.loads(message["text"])
                    message_type = data.get("type", "")
                    
                    if message_type == "message":
                        # User sent a text message
                        text_content = data.get("content", "")
                        if text_content:
                            # Process the message in a separate task
                            task = asyncio.create_task(
                                connection_manager.handle_user_message(connection_id, text_content)
                            )
                            connection_manager.tasks[connection_id] = task
                    
                    elif message_type == "frame":
                        # Process frame data from JSON with base64 encoded video/audio
                        frame_data = data.get("data", {})
                        
                        # Convert base64 to bytes
                        video_base64 = frame_data.get("video", "")
                        audio_base64 = frame_data.get("audio", "")
                        timestamp = frame_data.get("timestamp", 0)
                        
                        # Decode base64 data
                        video_bytes = base64.b64decode(video_base64) if video_base64 else b""
                        
                        # Process the video frame (ignore audio for simplicity in this example)
                        task = asyncio.create_task(
                            connection_manager.process_video_frame(connection_id, video_bytes)
                        )
                        connection_manager.tasks[connection_id] = task
                    
                    elif message_type == "audio":
                        # Process audio-only data
                        audio_data = data.get("data", {})
                        audio_base64 = audio_data.get("audio", "")
                        timestamp = audio_data.get("timestamp", 0)
                        
                        if audio_base64:
                            # Decode the base64 audio
                            audio_bytes = base64.b64decode(audio_base64)
                            
                            # Process the audio
                            task = asyncio.create_task(
                                connection_manager.process_audio(connection_id, audio_bytes)
                            )
                            connection_manager.tasks[connection_id] = task
                    
                    elif message_type == "settings":
                        # User updated settings
                        logger.info(f"Received settings update: {data}")
                        
                except json.JSONDecodeError:
                    logger.error(f"Invalid JSON: {message['text']}")
            
            elif "bytes" in message:
                # For backward compatibility, still handle binary data if sent
                logger.warning("Received binary data directly. Using base64 JSON is preferred.")
                data_type = message.get("type", "")
                
                if data_type == "video":
                    # Process video frame
                    frame_data = message["bytes"]
                    task = asyncio.create_task(
                        connection_manager.process_video_frame(connection_id, frame_data)
                    )
                    connection_manager.tasks[connection_id] = task
                
                elif data_type == "audio":
                    # Process audio
                    audio_data = message["bytes"]
                    task = asyncio.create_task(
                        connection_manager.process_audio(connection_id, audio_data)
                    )
                    connection_manager.tasks[connection_id] = task
            
            else:
                logger.warning(f"Unknown message format: {message}")
    
    except WebSocketDisconnect:
        logger.info(f"WebSocket disconnected: {connection_id}")
    except Exception as e:
        logger.error(f"WebSocket error: {str(e)}")
    finally:
        # Clean up when the connection is closed
        await connection_manager.disconnect(connection_id)