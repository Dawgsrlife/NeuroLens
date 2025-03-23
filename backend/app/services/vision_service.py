import base64
import io
import uuid
import logging
import numpy as np
import cv2
import json
from typing import List, Tuple, Dict, Any, Optional
from PIL import Image
import pytesseract
from openai import OpenAI
from ultralytics import YOLO
import torch
from app.config import settings
from app.models.schemas import DetectedObject, DetectedText, Caption, CaptionType, CaptionPriority, ProcessedFrame, VoiceFeedback

pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

logger = logging.getLogger(__name__)

class VisionService:
    def __init__(self):
        self.client = OpenAI(api_key=settings.OPENAI_API_KEY)
        self.confidence_threshold = settings.DETECTION_CONFIDENCE_THRESHOLD
        self.ocr_confidence_threshold = settings.OCR_CONFIDENCE_THRESHOLD
        self.last_processed_frame = None
        self.frame_counter = 0
        
        # Initialize YOLOv8 nano model - smallest version for edge devices
        try:
            # Try to load from a local path first if it exists
            model_path = "models/yolov8n.pt"
            import os
            if os.path.exists(model_path):
                self.yolo_model = YOLO(model_path)
            else:
                # Download from Ultralytics
                self.yolo_model = YOLO("yolov8n.pt")
            
            logger.info("YOLOv8 nano model loaded successfully")
            self.yolo_available = True
        except Exception as e:
            logger.error(f"Failed to load YOLOv8 model: {str(e)}")
            self.yolo_available = False
    
    async def process_frame(self, frame_data: bytes) -> ProcessedFrame:
        """Process a single frame from the webcam"""
        try:
            # Convert bytes to numpy array (OpenCV format)
            frame = self._bytes_to_cv_frame(frame_data)
            
            # Skip processing every N frames to reduce computational load
            self.frame_counter += 1
            if self.frame_counter % 10 != 0 and self.last_processed_frame is not None:
                # Return the last processed frame with a new ID
                self.last_processed_frame.frame_id = str(uuid.uuid4())
                return self.last_processed_frame
            
            # Generate a base64 encoded image for OpenAI API
            base64_image = self._encode_image(frame)
            
            # Run parallel processing
            # 1. Get scene description from OpenAI Vision
            scene_description = await self._get_scene_description(base64_image)
            
            # 2. Detect objects in the frame
            detected_objects = await self._detect_objects(frame)
            
            # 3. Extract text from the frame
            if settings.ENABLE_OCR:
                detected_texts = await self._extract_text(frame)
            else:
                detected_texts = []
            
            # 4. Check for credit cards or sensitive information
            sensitive_info_detected = any(text.is_sensitive or text.is_card_number for text in detected_texts)
            
            # Generate captions based on the scene description and detected objects/text
            captions = self._generate_captions(scene_description, detected_objects, detected_texts)
            
            # Generate voice feedback if sensitive information is detected
            voice_feedback = None
            if sensitive_info_detected:
                voice_feedback = self._generate_voice_feedback(detected_texts, detected_objects)
            
            # Create the processed frame result
            result = ProcessedFrame(
                captions=captions,
                voiceFeedback=voice_feedback,
                objects=[{
                    "name": obj.name,
                    "distance": obj.distance if obj.distance else 0,
                    "direction": obj.direction if obj.direction else "center"
                } for obj in detected_objects],
                raw_description=scene_description,
                detected_texts=detected_texts,
                detected_objects=detected_objects,
                frame_id=str(uuid.uuid4())
            )
            
            # Store the result for potential reuse
            self.last_processed_frame = result
            
            return result
        
        except Exception as e:
            logger.error(f"Error processing frame: {str(e)}")
            return ProcessedFrame(
                captions=[Caption(
                    id=str(uuid.uuid4()),
                    text=f"Error processing frame: {str(e)}",
                    type=CaptionType.VISUAL,
                    priority=CaptionPriority.HIGH
                )],
                frame_id=str(uuid.uuid4())
            )
    
    async def _get_scene_description(self, base64_image: str) -> str:
        """Get a description of the scene from OpenAI Vision"""
        try:
            response = self.client.chat.completions.create(
                model=settings.VISION_MODEL,
                messages=[
                    {
                        "role": "system",
                        "content": (
                            "You are a vision assistant for blind and visually impaired people. "
                            "Describe the scene, focusing on important elements that would help a blind person "
                            "understand their environment. Be concise but detailed. "
                            "Mention specific objects, their approximate location, text content, and potential hazards. "
                            "Identify any credit cards, sensitive documents, money or other personal items visible."
                        )
                    },
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": "What can you see in this image? Describe it for a blind person."},
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": f"data:image/jpeg;base64,{base64_image}"
                                }
                            }
                        ]
                    }
                ],
                max_tokens=settings.VISION_MAX_TOKENS
            )
            return response.choices[0].message.content
        except Exception as e:
            logger.error(f"Error getting scene description: {str(e)}")
            return "Unable to describe the scene at this time."
    
    async def _detect_objects(self, frame: np.ndarray) -> List[DetectedObject]:
        """Detect objects in the frame using YOLOv8 nano"""
        detected_objects = []
        height, width = frame.shape[:2]
        
        try:
            if self.yolo_available:
                # Run YOLOv8 inference on the frame
                results = self.yolo_model.predict(
                    source=frame,
                    conf=self.confidence_threshold,
                    verbose=False,
                )
                
                # Process YOLOv8 results
                if len(results) > 0:
                    result = results[0]  # Get the first result
                    
                    # Extract boxes, confidence scores, and class IDs
                    boxes = result.boxes.xyxy.cpu().numpy() if len(result.boxes) > 0 else []
                    confs = result.boxes.conf.cpu().numpy() if len(result.boxes) > 0 else []
                    class_ids = result.boxes.cls.cpu().numpy().astype(int) if len(result.boxes) > 0 else []
                    
                    # Get class names
                    class_names = result.names
                    
                    # Process each detection
                    for i, (box, conf, class_id) in enumerate(zip(boxes, confs, class_ids)):
                        if conf >= self.confidence_threshold:
                            x1, y1, x2, y2 = box
                            
                            # Get object name from class ID
                            obj_name = class_names[class_id]
                            
                            # Calculate direction based on the object's position
                            center_x = (x1 + x2) / 2
                            if center_x < width / 3:
                                direction = "left"
                            elif center_x > 2 * width / 3:
                                direction = "right"
                            else:
                                direction = "center"
                            
                            # Estimate distance based on the size of the bounding box and position
                            # Objects lower in the frame and with larger boxes are typically closer
                            box_height = y2 - y1
                            box_relative_height = box_height / height
                            y_position = (y1 + y2) / 2 / height  # Normalized y-position
                            
                            # Distance estimation formula - objects lower in the frame (higher y) are closer
                            # and objects with larger bounding boxes are closer
                            # This is a heuristic and can be refined with camera parameters
                            distance = (1.0 - y_position) * 5.0  # 0-5 meters
                            if box_relative_height > 0.5:
                                distance *= 0.5  # Very large objects are closer
                            elif box_relative_height > 0.25:
                                distance *= 0.75  # Large objects are closer
                                
                            # Clamp distance between 0.5 and 10 meters
                            distance = max(0.5, min(10.0, distance))
                            
                            detected_objects.append(DetectedObject(
                                name=obj_name,
                                confidence=float(conf),
                                bbox=[float(x1), float(y1), float(x2), float(y2)],
                                distance=distance,
                                direction=direction
                            ))
            else:
                # If YOLO is not available, fall back to the simple region-based approach
                logger.warning("YOLO model not available. Using fallback object detection.")
                
                # Simulate detection by dividing the frame into regions
                regions = [
                    (0, 0, width//2, height//2),
                    (width//2, 0, width, height//2),
                    (0, height//2, width//2, height),
                    (width//2, height//2, width, height),
                ]
                
                for i, (x1, y1, x2, y2) in enumerate(regions):
                    # Extract region and get its average color
                    region = frame[y1:y2, x1:x2]
                    avg_color = np.mean(region, axis=(0, 1))
                    
                    # Determine a placeholder object based on the color
                    if np.mean(avg_color) > 200:  # Very bright region
                        obj_name = "bright object"
                    elif np.mean(avg_color) < 50:  # Very dark region
                        obj_name = "dark object"
                    else:
                        obj_name = f"object {i+1}"
                    
                    # Calculate a direction based on the region position
                    if x1 < width // 3:
                        direction = "left"
                    elif x1 > 2 * width // 3:
                        direction = "right"
                    else:
                        direction = "center"
                    
                    # Calculate a fake distance based on y-position (lower in the frame = closer)
                    relative_y = y1 / height
                    distance = 1.0 + 4.0 * relative_y  # 1 to 5 meters
                    
                    detected_objects.append(DetectedObject(
                        name=obj_name,
                        confidence=0.8,  # Placeholder confidence
                        bbox=[float(x1), float(y1), float(x2), float(y2)],
                        distance=distance,
                        direction=direction
                    ))
        
        except Exception as e:
            logger.error(f"Error detecting objects: {str(e)}")
            # If there's an error, return an empty list or fallback to simple regions
            if not detected_objects:
                # Placeholder object in the center
                detected_objects.append(DetectedObject(
                    name="unknown object",
                    confidence=0.5,
                    bbox=[float(width/4), float(height/4), float(3*width/4), float(3*height/4)],
                    distance=2.0,
                    direction="center"
                ))
        
        return detected_objects
    
    async def _extract_text(self, frame: np.ndarray) -> List[DetectedText]:
        """Extract text from the frame using OCR"""
        try:
            # Convert frame to PIL Image for tesseract
            pil_image = Image.fromarray(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
            
            # Get OCR data with bounding boxes
            ocr_data = pytesseract.image_to_data(pil_image, output_type=pytesseract.Output.DICT)
            
            detected_texts = []
            
            # Process OCR results
            for i in range(len(ocr_data['text'])):
                # Skip empty text or low confidence
                if int(float(ocr_data['conf'][i])) < self.ocr_confidence_threshold or not ocr_data['text'][i].strip():
                    continue
                
                # Get bounding box
                x = ocr_data['left'][i]
                y = ocr_data['top'][i]
                w = ocr_data['width'][i]
                h = ocr_data['height'][i]
                
                text = ocr_data['text'][i].strip()
                confidence = float(ocr_data['conf'][i]) / 100.0
                
                # Check if it looks like a credit card number (16 digits, possibly with spaces)
                is_card_number = bool(
                    len(''.join(c for c in text if c.isdigit())) in [15, 16] and  # Amex has 15 digits
                    any(c.isdigit() for c in text)
                )
                
                # Check if it contains other sensitive information
                is_sensitive = any(keyword in text.lower() for keyword in [
                    'ssn', 'social security', 'password', 'pin', 'secret', 
                    'username', 'login', 'account'
                ])
                
                detected_texts.append(DetectedText(
                    text=text,
                    confidence=confidence,
                    bbox=[float(x), float(y), float(x+w), float(y+h)],
                    is_card_number=is_card_number,
                    is_sensitive=is_sensitive
                ))
            
            return detected_texts
        except Exception as e:
            logger.error(f"Error extracting text: {str(e)}")
            return []
    
    def _generate_captions(
        self, 
        scene_description: str, 
        detected_objects: List[DetectedObject],
        detected_texts: List[DetectedText]
    ) -> List[Caption]:
        """Generate captions based on the processed data"""
        captions = []
        
        # Add the main scene description
        captions.append(Caption(
            id=str(uuid.uuid4()),
            text=scene_description,
            type=CaptionType.VISUAL,
            priority=CaptionPriority.MEDIUM
        ))
        
        # Add captions for detected objects
        if detected_objects:
            nearby_objects = [obj for obj in detected_objects if obj.distance and obj.distance < 2.0]
            if nearby_objects:
                nearby_text = "Nearby objects: " + ", ".join(
                    f"{obj.name} to your {obj.direction}" for obj in nearby_objects
                )
                captions.append(Caption(
                    id=str(uuid.uuid4()),
                    text=nearby_text,
                    type=CaptionType.VISUAL,
                    priority=CaptionPriority.HIGH
                ))
        
        # Add captions for detected text
        if detected_texts:
            sensitive_texts = [txt for txt in detected_texts if txt.is_sensitive or txt.is_card_number]
            
            if sensitive_texts:
                sensitive_warning = "Sensitive information detected. Be cautious about privacy."
                captions.append(Caption(
                    id=str(uuid.uuid4()),
                    text=sensitive_warning,
                    type=CaptionType.VISUAL,
                    priority=CaptionPriority.HIGH
                ))
            
            # Add captions for normal detected text
            other_texts = [txt for txt in detected_texts if not (txt.is_sensitive or txt.is_card_number)]
            if other_texts:
                texts_found = "Text found: " + "; ".join(txt.text for txt in other_texts[:3])
                captions.append(Caption(
                    id=str(uuid.uuid4()),
                    text=texts_found,
                    type=CaptionType.VISUAL,
                    priority=CaptionPriority.MEDIUM
                ))
        
        return captions
    
    def _generate_voice_feedback(
        self, 
        detected_texts: List[DetectedText],
        detected_objects: List[DetectedObject]
    ) -> Optional[VoiceFeedback]:
        """Generate voice feedback, especially for sensitive information"""
        sensitive_texts = [txt for txt in detected_texts if txt.is_sensitive or txt.is_card_number]
        
        if sensitive_texts:
            # For credit cards, provide a special warning
            card_texts = [txt for txt in sensitive_texts if txt.is_card_number]
            if card_texts:
                return VoiceFeedback(
                    text="I notice what appears to be a credit card or payment card. Be careful about exposing this in public. If you need to read the card number, please make sure no one is watching.",
                    priority=CaptionPriority.HIGH
                )
            # For other sensitive info
            return VoiceFeedback(
                text="I've detected what appears to be sensitive information in view of the camera. Please be cautious about privacy.",
                priority=CaptionPriority.HIGH
            )
        
        # For nearby objects that might be hazards
        nearby_objects = [obj for obj in detected_objects if obj.distance and obj.distance < 1.5]
        if nearby_objects:
            return VoiceFeedback(
                text=f"Be careful of nearby objects: {', '.join(obj.name + ' to your ' + obj.direction for obj in nearby_objects[:3])}",
                priority=CaptionPriority.MEDIUM
            )
        
        return None
    
    def _bytes_to_cv_frame(self, frame_data: bytes) -> np.ndarray:
        """Convert bytes to OpenCV frame"""
        # Convert bytes to numpy array
        nparr = np.frombuffer(frame_data, np.uint8)
        # Decode image
        return cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    def _encode_image(self, frame: np.ndarray) -> str:
        """Encode an image as base64 for the OpenAI API"""
        # Convert frame to JPEG
        _, buffer = cv2.imencode('.jpg', frame)
        # Convert to base64
        return base64.b64encode(buffer).decode('utf-8')