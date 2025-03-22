import base64
import io
import os
import cv2
import numpy as np
from typing import Tuple, Optional, Dict, Any, List
from PIL import Image
import uuid
import time
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

def generate_id() -> str:
    """Generate a unique ID for items"""
    return str(uuid.uuid4())

def get_timestamp() -> float:
    """Get current timestamp in seconds"""
    return datetime.now().timestamp()

def decode_base64_image(base64_string: str) -> np.ndarray:
    """Decode a base64 image to OpenCV format"""
    # Remove data URL prefix if present
    if "," in base64_string:
        base64_string = base64_string.split(",")[1]
    
    # Decode base64 string
    img_data = base64.b64decode(base64_string)
    
    # Convert to numpy array
    nparr = np.frombuffer(img_data, np.uint8)
    
    # Decode image
    return cv2.imdecode(nparr, cv2.IMREAD_COLOR)

def encode_image_to_base64(image: np.ndarray, format: str = "jpeg") -> str:
    """Encode an OpenCV image to base64"""
    # Choose the correct extension
    ext = ".jpg" if format.lower() == "jpeg" else f".{format.lower()}"
    
    # Encode image to bytes
    success, buffer = cv2.imencode(ext, image)
    if not success:
        raise ValueError("Failed to encode image")
    
    # Convert to base64
    base64_str = base64.b64encode(buffer).decode("utf-8")
    
    # Return as data URL
    return f"data:image/{format.lower()};base64,{base64_str}"

def resize_image(image: np.ndarray, max_size: int = 800) -> np.ndarray:
    """Resize an image to have maximum dimension of max_size while preserving aspect ratio"""
    height, width = image.shape[:2]
    
    # Calculate new dimensions
    if height > width:
        if height > max_size:
            ratio = max_size / height
            new_height = max_size
            new_width = int(width * ratio)
        else:
            return image
    else:
        if width > max_size:
            ratio = max_size / width
            new_width = max_size
            new_height = int(height * ratio)
        else:
            return image
    
    # Resize the image
    return cv2.resize(image, (new_width, new_height), interpolation=cv2.INTER_AREA)

def detect_text_area(image: np.ndarray) -> List[Tuple[int, int, int, int]]:
    """
    Detect regions that likely contain text
    Returns list of bounding boxes in format (x1, y1, x2, y2)
    """
    # Convert to grayscale
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    
    # Apply Gaussian blur
    blurred = cv2.GaussianBlur(gray, (5, 5), 0)
    
    # Apply thresholding
    _, thresh = cv2.threshold(blurred, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)
    
    # Find contours
    contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    # Filter contours based on size and shape
    text_regions = []
    for contour in contours:
        x, y, w, h = cv2.boundingRect(contour)
        
        # Filter out very small regions
        if w < 20 or h < 20:
            continue
        
        # Filter out non-rectangular (very irregular) shapes
        area = cv2.contourArea(contour)
        rect_area = w * h
        if area / rect_area < 0.4:  # If filled area is less than 40% of bounding rect
            continue
        
        # Check aspect ratio - text is usually wider than tall
        aspect_ratio = w / h
        if aspect_ratio < 1.5 and w < 50:  # Skip tall, narrow regions unless they're wide
            continue
        
        text_regions.append((x, y, x+w, y+h))
    
    return text_regions

def estimate_distance(bbox_height: float, frame_height: float) -> float:
    """
    Estimate distance based on bounding box height relative to frame
    This is a very rough estimation - in a real implementation, you'd use depth sensing
    """
    # The smaller the bounding box, the further away the object is
    relative_size = bbox_height / frame_height
    
    # Convert to a distance in meters (very approximate)
    # Assumes a 1/size relationship
    if relative_size > 0.8:
        return 0.5  # Very close, about 0.5 meters
    elif relative_size > 0.5:
        return 1.0  # Close, about 1 meter
    elif relative_size > 0.25:
        return 2.0  # Medium distance, about 2 meters
    elif relative_size > 0.1:
        return 3.5  # Far, about 3-4 meters
    else:
        return 6.0  # Very far, about 5+ meters

def determine_direction(bbox_center_x: float, frame_width: float) -> str:
    """Determine the direction of an object relative to the center of the frame"""
    relative_position = bbox_center_x / frame_width
    
    if relative_position < 0.33:
        return "left"
    elif relative_position > 0.67:
        return "right"
    else:
        return "center"

def is_credit_card(image: np.ndarray) -> bool:
    """
    Simple heuristic to check if an image contains a credit card
    This is a very basic implementation - in reality, you'd use a more sophisticated approach
    """
    # Convert to grayscale
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    
    # Apply edge detection
    edges = cv2.Canny(gray, 50, 150)
    
    # Check for rectangular shape with aspect ratio of a credit card
    contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    for contour in contours:
        # Approximate contour to simplify shape
        epsilon = 0.02 * cv2.arcLength(contour, True)
        approx = cv2.approxPolyDP(contour, epsilon, True)
        
        # Credit cards are rectangles (4 corners)
        if len(approx) == 4:
            x, y, w, h = cv2.boundingRect(approx)
            
            # Credit cards have an aspect ratio of approximately 1.58 (85.6mm x 54mm)
            aspect_ratio = w / h
            if 1.4 < aspect_ratio < 1.8:
                # Check if it's large enough to be a card
                area = w * h
                if area > (image.shape[0] * image.shape[1]) / 16:  # At least 1/16 of image
                    return True
    
    return False

def format_time_ago(timestamp: float) -> str:
    """Format a timestamp as a human-readable time ago string"""
    now = get_timestamp()
    diff = now - timestamp
    
    if diff < 60:
        return "just now"
    elif diff < 3600:
        minutes = int(diff // 60)
        return f"{minutes} minute{'s' if minutes != 1 else ''} ago"
    elif diff < 86400:
        hours = int(diff // 3600)
        return f"{hours} hour{'s' if hours != 1 else ''} ago"
    else:
        days = int(diff // 86400)
        return f"{days} day{'s' if days != 1 else ''} ago"