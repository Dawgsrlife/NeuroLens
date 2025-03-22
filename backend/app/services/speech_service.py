import asyncio
import base64
import io
import logging
import tempfile
import os
import uuid
from typing import Optional, Tuple, Dict, Any, List
import numpy as np
from pydub import AudioSegment
import sounddevice as sd
import scipy.io.wavfile as wav
from openai import OpenAI
from app.config import settings

logger = logging.getLogger(__name__)

class SpeechService:
    def __init__(self):
        self.client = OpenAI(api_key=settings.OPENAI_API_KEY)
        self.stt_model = settings.STT_MODEL
        self.tts_model = settings.TTS_MODEL
        self.tts_voice = settings.TTS_VOICE
        self.sample_rate = 24000  # OpenAI API expects 24kHz audio
        self.is_speaking = False
        self.speaking_lock = asyncio.Lock()
    
    async def transcribe_audio(self, audio_data: bytes) -> str:
        """
        Transcribe audio data to text using OpenAI's speech-to-text API
        """
        try:
            # Save audio data to a temporary file
            with tempfile.NamedTemporaryFile(suffix=".webm", delete=False) as temp_file:
                temp_file.write(audio_data)
                temp_file_path = temp_file.name

            # Transcribe the audio
            with open(temp_file_path, "rb") as audio_file:
                transcript = self.client.audio.transcriptions.create(
                    model=self.stt_model,
                    file=audio_file,
                    response_format="text"
                )
            
            # Clean up the temporary file
            os.unlink(temp_file_path)
            
            return transcript
        
        except Exception as e:
            logger.error(f"Error transcribing audio: {str(e)}")
            return ""
    
    async def text_to_speech(self, text: str) -> bytes:
        """
        Convert text to speech using OpenAI's text-to-speech API
        """
        try:
            response = self.client.audio.speech.create(
                model=self.tts_model,
                voice=self.tts_voice,
                input=text
            )
            
            # Get the audio content
            audio_data = response.read()
            
            return audio_data
        
        except Exception as e:
            logger.error(f"Error generating speech: {str(e)}")
            return b""
    
    async def stream_speech(self, text: str) -> bytes:
        """
        Generate speech and stream it for immediate playback
        """
        audio_data = await self.text_to_speech(text)
        
        # In a real implementation, you'd stream this to a client
        # For this example, we'll just return the full audio
        return audio_data

    async def process_streaming_transcription(self, audio_chunk: bytes) -> Optional[str]:
        """
        Process streaming audio transcription for real-time interaction
        """
        try:
            # Convert the audio chunk to the right format if needed
            # For the Realtime API, we'd need to set up a WebSocket connection
            # Since that requires more complex code, we'll use the regular transcription endpoint
            
            result = await self.transcribe_audio(audio_chunk)
            if result:
                logger.info(f"Transcribed text: {result}")
                return result
            
            return None
            
        except Exception as e:
            logger.error(f"Error in streaming transcription: {str(e)}")
            return None
    
    async def speak(self, text: str) -> None:
        """
        Generate and play speech using the text-to-speech API
        This method ensures only one speech is played at a time
        """
        async with self.speaking_lock:
            self.is_speaking = True
            try:
                # Generate the speech
                audio_data = await self.text_to_speech(text)
                
                if not audio_data:
                    logger.warning("No audio data generated")
                    self.is_speaking = False
                    return
                
                # Convert to in-memory WAV
                audio = AudioSegment.from_file(io.BytesIO(audio_data), format="mp3")
                wav_io = io.BytesIO()
                audio.export(wav_io, format="wav")
                wav_io.seek(0)
                
                # Read the WAV data
                rate, data = wav.read(wav_io)
                
                # Convert to float32 for sounddevice
                if data.dtype != np.float32:
                    data = data.astype(np.float32) / np.iinfo(data.dtype).max
                
                # Play the audio (this blocks until audio is done playing)
                sd.play(data, rate)
                sd.wait()
                
            except Exception as e:
                logger.error(f"Error in speak method: {str(e)}")
            finally:
                self.is_speaking = False
    
    async def stop_speaking(self) -> None:
        """Stop any currently playing speech"""
        if self.is_speaking:
            sd.stop()
            self.is_speaking = False