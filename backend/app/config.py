import os
from typing import Optional
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Settings(BaseSettings):
    # API keys
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    
    # Application settings
    APP_NAME: str = "NeuroLens Backend"
    DEBUG: bool = os.getenv("DEBUG", "False").lower() == "true"
    
    # WebSocket settings
    WS_PING_INTERVAL: int = 30  # seconds
    
    # Vision settings
    VISION_MODEL: str = "gpt-4o-mini"
    DETECTION_CONFIDENCE_THRESHOLD: float = 0.4  # Slightly lower threshold for YOLO
    VISION_MAX_TOKENS: int = 1000
    YOLO_MODEL_PATH: Optional[str] = None  # If None, will download from ultralytics
    
    # Speech settings
    STT_MODEL: str = "gpt-4o-mini-transcribe1"
    TTS_MODEL: str = "gpt-4o-mini-tts1"
    TTS_VOICE: str = "shimmer"  # Available voices: alloy, echo, fable, onyx, nova, shimmer
    
    # Agent settings
    AGENT_MODEL: str = "gpt-4o-mini"
    AGENT_TEMPERATURE: float = 0.7
    AGENT_MAX_TOKENS: int = 1500
    
    # Memory settings
    MEMORY_MAX_MESSAGES: int = 20
    
    # Additional component settings
    ENABLE_OCR: bool = True
    OCR_CONFIDENCE_THRESHOLD: float = 70.0
    
    # Security
    CORS_ORIGINS: list[str] = ["http://localhost:3000"]
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

settings = Settings()