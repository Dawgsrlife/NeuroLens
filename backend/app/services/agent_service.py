import asyncio
import logging
import uuid
from typing import Any, Dict, List, Optional, Tuple
import json
from openai import OpenAI

from agents import Agent, Runner, function_tool, RunContextWrapper, trace, ModelSettings

from app.config import settings
from app.models.schemas import (
    Caption,
    CaptionPriority,
    CaptionType,
    ConversationContext,
    DetectedObject,
    DetectedText,
    Message,
    MessageRole,
    ProcessedFrame,
    VoiceFeedback
)
from app.services.vision_service import VisionService
from app.services.speech_service import SpeechService
from app.services.memory_service import MemoryService

logger = logging.getLogger(__name__)

class AgentContext:
    """Context object passed to agent tools"""
    def __init__(self):
        self.current_frame: Optional[ProcessedFrame] = None
        self.memory: MemoryService = MemoryService()
        self.vision: VisionService = VisionService()
        self.speech: SpeechService = SpeechService()
        self.last_query: Optional[str] = None
        self.user_settings: Dict[str, Any] = {
            "voice_enabled": True,
            "high_contrast_mode": False,
            "detection_range": "medium"
        }
    
    def update_frame(self, frame: ProcessedFrame):
        """Update the current frame data"""
        self.current_frame = frame
    
    def add_message(self, role: MessageRole, content: str):
        """Add a message to the conversation history"""
        self.memory.add_message(role, content)


class AgentService:
    def __init__(self):
        self.agent_context = AgentContext()
        self.vision_service = VisionService()
        self.speech_service = SpeechService()
        self.memory_service = MemoryService()
        
        # Set up the agent with tools
        self.assistant_agent = self._create_assistant_agent()
    
    def _create_assistant_agent(self) -> Agent:
        """Create the assistant agent with all necessary tools"""
        return Agent[AgentContext](
            name="NeuroLens",
            instructions="""
            You are NeuroLens, an advanced AI vision and voice assistant designed to help visually impaired and elderly users.
            Your primary goal is to provide useful, accurate, and concise information about the user's environment based on:
            1. Real-time video feed from their camera
            2. Voice queries from the user
            3. Contextual information from previous interactions

            Always prioritize:
            - SAFETY: Alert users to potential dangers or obstacles immediately
            - PRIVACY: Avoid reading aloud sensitive information like credit card numbers, passwords, or personal details
            - CLARITY: Speak clearly, use simple language, and be concise
            - HELPFULNESS: Respond to queries accurately and focus on what's most relevant to the user
            
            You can see what the user sees through their camera feed, and you have information about:
            - Objects detected in the scene, including distances and relative positions
            - Text detected in the environment
            - Overall scene description
            
            When users hold up documents, cards, or other items with text, you can help read the content while maintaining privacy.
            Provide spatial guidance using terms like "in front of you", "to your left/right", etc.
            
            Some common user needs include:
            - Reading text (mail, documents, labels, etc.)
            - Identifying objects and their locations
            - Navigation guidance
            - Financial assistance (identifying money, cards, etc.)
            - Finding lost items
            - Describing environment or people
            """,
            tools=[
                self._describe_current_scene,
                self._identify_objects,
                self._read_text_in_scene,
                self._check_for_hazards,
                self._identify_currency,
                self._answer_from_memory
            ],
            model=settings.AGENT_MODEL,
            model_settings=ModelSettings(temperature=settings.AGENT_TEMPERATURE)  # Use ModelSettings class instead of a dictionary
        )
    
    async def process_query(self, query: str, current_frame: ProcessedFrame) -> Tuple[str, VoiceFeedback]:
        """Process a user query and return a response"""
        # Update the agent context with the latest frame
        self.agent_context.update_frame(current_frame)
        self.agent_context.last_query = query
        
        # Add the user message to memory
        self.agent_context.add_message(MessageRole.USER, query)
        
        # Get the previous conversation context
        context = self.agent_context
        
        # Create a trace for this interaction
        with trace(workflow_name="NeuroLens Vision Assistant"):
            # Run the agent to process the query
            result = await Runner.run(
                self.assistant_agent, 
                query,
                context=context
            )
        
        # Extract the response
        response = result.final_output
        
        # Add the assistant response to memory
        self.agent_context.add_message(MessageRole.ASSISTANT, response)
        
        # Create a voice feedback object
        voice_feedback = VoiceFeedback(
            text=response,
            priority=CaptionPriority.HIGH
        )
        
        return response, voice_feedback
    
    @staticmethod
    @function_tool
    async def _describe_current_scene(ctx: RunContextWrapper[AgentContext]) -> str:
        """
        Describe the current scene in detail, focusing on the overall environment.
        """
        try:
            context = ctx.context
            if not context.current_frame:
                return "I don't have access to the camera feed right now."
            
            scene_description = context.current_frame.raw_description
            if not scene_description:
                return "I'm unable to clearly describe what I see right now."
            
            return scene_description
        except Exception as e:
            logger.error(f"Error describing scene: {str(e)}")
            return "I'm having trouble processing the visual information at the moment."
    
    @staticmethod
    @function_tool
    async def _identify_objects(ctx: RunContextWrapper[AgentContext]) -> str:
        """
        Identify and list the key objects visible in the current scene.
        """
        try:
            context = ctx.context
            if not context.current_frame:
                return "I don't have access to the camera feed right now."
            
            objects = context.current_frame.detected_objects
            if not objects:
                return "I don't see any clearly identifiable objects at the moment."
            
            # Sort objects by distance
            sorted_objects = sorted(objects, key=lambda obj: obj.distance if obj.distance else float('inf'))
            
            # Format the response
            result = "Here are the objects I can see:\n"
            for obj in sorted_objects[:5]:  # Limit to top 5 objects
                distance_str = f"about {obj.distance:.1f} meters away" if obj.distance else "at an unknown distance"
                direction = f"to your {obj.direction}" if obj.direction else ""
                result += f"- {obj.name} {distance_str} {direction}\n"
            
            return result
        except Exception as e:
            logger.error(f"Error identifying objects: {str(e)}")
            return "I'm having trouble identifying objects at the moment."
    
    @staticmethod
    @function_tool
    async def _read_text_in_scene(ctx: RunContextWrapper[AgentContext]) -> str:
        """
        Read and report any text visible in the current scene, excluding sensitive information.
        """
        try:
            context = ctx.context
            if not context.current_frame:
                return "I don't have access to the camera feed right now."
            
            texts = context.current_frame.detected_texts
            if not texts:
                return "I don't see any readable text at the moment."
            
            # Filter out sensitive texts
            non_sensitive_texts = [
                txt for txt in texts 
                if not (txt.is_sensitive or txt.is_card_number)
            ]
            
            if not non_sensitive_texts:
                return "I can see some text, but it appears to contain sensitive information that I shouldn't read aloud for privacy reasons."
            
            # Format the response
            result = "Here's the text I can read:\n"
            for i, txt in enumerate(non_sensitive_texts[:7]):  # Limit to 7 text items
                result += f"{i+1}. {txt.text}\n"
            
            # Add a privacy notice if some texts were filtered out
            if len(texts) > len(non_sensitive_texts):
                result += "\nNote: Some text that appears to contain sensitive information was omitted for privacy."
            
            return result
        except Exception as e:
            logger.error(f"Error reading text: {str(e)}")
            return "I'm having trouble reading text at the moment."
    
    @staticmethod
    @function_tool
    async def _check_for_hazards(ctx: RunContextWrapper[AgentContext]) -> str:
        """
        Check for any potential hazards or obstacles in the current scene.
        """
        try:
            context = ctx.context
            if not context.current_frame:
                return "I don't have access to the camera feed right now."
            
            # Check for nearby objects that might be hazards
            objects = context.current_frame.detected_objects
            nearby_objects = [obj for obj in objects if obj.distance and obj.distance < 1.5]
            
            if not nearby_objects:
                return "I don't see any immediate hazards or obstacles in your vicinity."
            
            # Format the response
            result = "Please be aware of these potential obstacles:\n"
            for obj in nearby_objects:
                result += f"- {obj.name} to your {obj.direction}, about {obj.distance:.1f} meters away\n"
            
            return result
        except Exception as e:
            logger.error(f"Error checking for hazards: {str(e)}")
            return "I'm having trouble assessing potential hazards at the moment."
    
    @staticmethod
    @function_tool
    async def _identify_currency(ctx: RunContextWrapper[AgentContext]) -> str:
        """
        Identify and describe any currency or payment cards visible in the scene.
        """
        try:
            context = ctx.context
            if not context.current_frame:
                return "I don't have access to the camera feed right now."
            
            # Look for text that might be on currency or cards
            texts = context.current_frame.detected_texts
            
            # Check for credit cards
            card_texts = [txt for txt in texts if txt.is_card_number]
            if card_texts:
                # Don't read the actual card number
                return (
                    "I can see what appears to be a payment card. For privacy reasons, "
                    "I won't read the card number aloud. If you need to know the card number, "
                    "please make sure you're in a private location."
                )
            
            # For currency detection, we would use the scene description
            # This is a simplified approach - a real implementation would use more sophisticated methods
            scene_description = context.current_frame.raw_description.lower()
            
            currency_keywords = ["dollar", "euro", "pound", "yen", "rupee", "bill", "coin", "note", "cash", "money"]
            if any(keyword in scene_description for keyword in currency_keywords):
                return "I can see what might be currency in the image. For a more specific identification, please hold it closer to the camera and ask me to describe it in detail."
            
            return "I don't see any clear signs of currency or payment cards."
        except Exception as e:
            logger.error(f"Error identifying currency: {str(e)}")
            return "I'm having trouble identifying any currency or payment cards at the moment."
    
    @staticmethod
    @function_tool
    async def _answer_from_memory(ctx: RunContextWrapper[AgentContext], question: str) -> str:
        """
        Answer a question based on the conversation history and memory.
        
        Args:
            question: The question to answer based on memory
        """
        try:
            context = ctx.context
            
            # Get the conversation history
            conversation = context.memory.get_conversation_history()
            
            if not conversation:
                return "I don't have any previous conversation context to reference."
            
            # For a sophisticated implementation, you would use an embedding search or similar
            # Here we'll use a simple approach by querying GPT with the conversation history
            
            # Prepare the conversation history as a string
            conversation_text = "\n".join([
                f"{msg.role}: {msg.content}" 
                for msg in conversation
            ])
            
            # Use the OpenAI client to generate a response based on memory
            client = OpenAI(api_key=settings.OPENAI_API_KEY)
            response = client.chat.completions.create(
                model=settings.AGENT_MODEL,
                messages=[
                    {
                        "role": "system",
                        "content": (
                            "You are an assistant with access to conversation history. "
                            "Answer the user's question based only on information in the provided conversation history."
                        )
                    },
                    {
                        "role": "user",
                        "content": (
                            f"Based on this conversation history:\n\n{conversation_text}\n\n"
                            f"Please answer this question: {question}"
                        )
                    }
                ],
                temperature=0.3,
                max_tokens=200
            )
            
            return response.choices[0].message.content
        except Exception as e:
            logger.error(f"Error answering from memory: {str(e)}")
            return "I'm having trouble recalling our previous conversation."