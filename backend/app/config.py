from pydantic_settings import BaseSettings
from typing import List
import json
from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

class Settings(BaseSettings):
    # API Settings
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "NeuroLens"
    
    # CORS Settings
    CORS_ORIGINS: List[str] = json.loads(os.getenv("CORS_ORIGINS", '["http://localhost:3000"]'))
    
    # OpenAI Settings
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    
    # Object Detection Settings
    CONFIDENCE_THRESHOLD: float = 0.5
    DETECTION_INTERVAL: float = 0.1  # seconds
    
    # Audio Settings
    AUDIO_ENABLED: bool = True
    TTS_RATE: int = 150
    TTS_VOLUME: float = 1.0
    
    # WebSocket Settings
    WS_HEARTBEAT_INTERVAL: int = 30  # seconds
    
    class Config:
        case_sensitive = True

settings = Settings() 