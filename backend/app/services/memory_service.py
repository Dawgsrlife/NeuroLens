import logging
from typing import List, Dict, Any, Optional
from datetime import datetime
from collections import deque

from app.config import settings
from app.models.schemas import ConversationContext, Message, MessageRole, DetectedObject, DetectedText

logger = logging.getLogger(__name__)

class MemoryService:
    """Service to manage conversation history and context"""
    
    def __init__(self):
        self.max_messages = settings.MEMORY_MAX_MESSAGES
        self.messages = deque(maxlen=self.max_messages)
        self.detected_objects_history = {}  # track objects seen over time
        self.detected_texts_history = {}    # track texts seen over time
        self.scene_descriptions = deque(maxlen=5)  # keep last 5 scene descriptions
    
    def add_message(self, role: MessageRole, content: str) -> None:
        """Add a message to the conversation history"""
        message = Message(
            role=role,
            content=content,
            timestamp=datetime.now().timestamp()
        )
        self.messages.append(message)
    
    def get_conversation_history(self) -> List[Message]:
        """Get the conversation history as a list of messages"""
        return list(self.messages)
    
    def add_detected_objects(self, objects: List[DetectedObject]) -> None:
        """Add detected objects to the memory"""
        current_time = datetime.now().timestamp()
        for obj in objects:
            obj_id = f"{obj.name}_{obj.bbox[0]}_{obj.bbox[1]}"
            self.detected_objects_history[obj_id] = {
                "object": obj,
                "last_seen": current_time,
                "first_seen": self.detected_objects_history.get(obj_id, {}).get("first_seen", current_time)
            }
        
        # Clean up old objects (older than 5 minutes)
        cutoff_time = current_time - 300  # 5 minutes in seconds
        self.detected_objects_history = {
            k: v for k, v in self.detected_objects_history.items()
            if v["last_seen"] > cutoff_time
        }
    
    def add_detected_texts(self, texts: List[DetectedText]) -> None:
        """Add detected texts to the memory"""
        current_time = datetime.now().timestamp()
        for text in texts:
            text_id = f"{text.text}_{text.bbox[0]}_{text.bbox[1]}"
            self.detected_texts_history[text_id] = {
                "text": text,
                "last_seen": current_time,
                "first_seen": self.detected_texts_history.get(text_id, {}).get("first_seen", current_time)
            }
        
        # Clean up old texts (older than 5 minutes)
        cutoff_time = current_time - 300  # 5 minutes in seconds
        self.detected_texts_history = {
            k: v for k, v in self.detected_texts_history.items()
            if v["last_seen"] > cutoff_time
        }
    
    def add_scene_description(self, description: str) -> None:
        """Add a scene description to the memory"""
        self.scene_descriptions.append({
            "description": description,
            "timestamp": datetime.now().timestamp()
        })
    
    def get_current_context(self) -> ConversationContext:
        """Get the current conversation context"""
        return ConversationContext(
            messages=list(self.messages),
            detected_objects=[item["object"] for item in self.detected_objects_history.values()],
            detected_texts=[item["text"] for item in self.detected_texts_history.values()],
            current_scene_description=self.scene_descriptions[-1]["description"] if self.scene_descriptions else None,
            last_processed_timestamp=datetime.now().timestamp()
        )
    
    def clear_history(self) -> None:
        """Clear all conversation history"""
        self.messages.clear()
        self.detected_objects_history.clear()
        self.detected_texts_history.clear()
        self.scene_descriptions.clear()
    
    def get_recent_objects(self, seconds: int = 30) -> List[DetectedObject]:
        """Get objects detected in the last N seconds"""
        current_time = datetime.now().timestamp()
        cutoff_time = current_time - seconds
        
        recent_objects = [
            item["object"] 
            for item in self.detected_objects_history.values()
            if item["last_seen"] > cutoff_time
        ]
        
        return recent_objects
    
    def get_recent_texts(self, seconds: int = 30) -> List[DetectedText]:
        """Get texts detected in the last N seconds"""
        current_time = datetime.now().timestamp()
        cutoff_time = current_time - seconds
        
        recent_texts = [
            item["text"] 
            for item in self.detected_texts_history.values()
            if item["last_seen"] > cutoff_time
        ]
        
        return recent_texts
    
    def search_conversation(self, query: str) -> List[Message]:
        """
        Simple search through conversation history
        A more sophisticated implementation would use embeddings
        """
        query = query.lower()
        matches = []
        
        for message in self.messages:
            if query in message.content.lower():
                matches.append(message)
        
        return matches