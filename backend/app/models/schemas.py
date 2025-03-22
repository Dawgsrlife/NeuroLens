from enum import Enum
from typing import List, Optional, Dict, Any, Union
from pydantic import BaseModel, Field
from datetime import datetime


class MessageRole(str, Enum):
    SYSTEM = "system"
    USER = "user"
    ASSISTANT = "assistant"


class DetectedObject(BaseModel):
    name: str
    confidence: float
    bbox: List[float] = Field(..., description="Bounding box [x1, y1, x2, y2]")
    distance: Optional[float] = None  # Estimated distance
    direction: Optional[str] = None  # Relative direction (left, right, center)


class DetectedText(BaseModel):
    text: str
    confidence: float
    bbox: List[float] = Field(..., description="Bounding box [x1, y1, x2, y2]")
    is_card_number: bool = False
    is_sensitive: bool = False


class CaptionPriority(str, Enum):
    LOW = "low"
    MEDIUM = "medium" 
    HIGH = "high"


class CaptionType(str, Enum):
    VISUAL = "visual"
    AUDIO = "audio"


class Caption(BaseModel):
    id: str
    text: str
    type: CaptionType
    timestamp: float = Field(default_factory=lambda: datetime.now().timestamp())
    priority: CaptionPriority = CaptionPriority.MEDIUM


class VoiceFeedback(BaseModel):
    text: str
    priority: CaptionPriority = CaptionPriority.MEDIUM
    timestamp: float = Field(default_factory=lambda: datetime.now().timestamp())


class ProcessedFrame(BaseModel):
    captions: List[Caption] = []
    voiceFeedback: Optional[VoiceFeedback] = None
    objects: List[dict] = []
    raw_description: Optional[str] = None
    detected_texts: List[DetectedText] = []
    detected_objects: List[DetectedObject] = []
    frame_id: Optional[str] = None


class WebcamSettings(BaseModel):
    enabled: bool = True
    detection_range: str = "medium"  # short, medium, long
    update_frequency: str = "medium"  # high, medium, low
    sensitivity: float = 0.5  # 0.0 to 1.0


class VoiceSettings(BaseModel):
    enabled: bool = True
    volume: float = 0.8  # 0.0 to 1.0
    voice_style: str = "natural"  # natural, clear, detailed
    speech_rate: float = 1.0  # 0.5 to 2.0


class UserSettings(BaseModel):
    webcam: WebcamSettings = Field(default_factory=WebcamSettings)
    voice: VoiceSettings = Field(default_factory=VoiceSettings)
    high_contrast_mode: bool = False
    screen_reader_optimizations: bool = False


class Message(BaseModel):
    role: MessageRole
    content: str
    timestamp: float = Field(default_factory=lambda: datetime.now().timestamp())


class ConversationContext(BaseModel):
    messages: List[Message] = []
    detected_objects: List[DetectedObject] = []
    detected_texts: List[DetectedText] = []
    current_scene_description: Optional[str] = None
    last_processed_timestamp: Optional[float] = None