'use client';

import { useEffect, useState, useRef } from "react";
import { apiService } from "@/services/api";
import { ProcessedFrame } from "@/types/api";
import { MicrophoneIcon, StopIcon } from "@heroicons/react/24/solid";
import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';
import { MicrophoneIcon as OutlinedMicrophoneIcon } from '@heroicons/react/24/outline';

interface VoiceInteractionPanelProps {
  className?: string;
}

export const VoiceInteractionPanel = ({ className = "" }: VoiceInteractionPanelProps) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [feedback, setFeedback] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  // Define handleMessage at the component level
  const handleMessage = (data: ProcessedFrame) => {
    if (data.voiceFeedback) {
      setFeedback(data.voiceFeedback.text);

      // Use the browser's speech synthesis to speak the response
      if ("speechSynthesis" in window) {
        const speech = new SpeechSynthesisUtterance(data.voiceFeedback.text);
        window.speechSynthesis.speak(speech);
      }
    }

    if (data.captions) {
      const userMessages = data.captions.filter((c) => c.type === "audio");
      if (userMessages.length > 0) {
        setTranscript(userMessages[0].text);
      }
    }
  };

  useEffect(() => {
    // Set up the WebSocket connection
    apiService.initializeWebSocket({
      onMessage: handleMessage,
      onError: (error) => console.error("WebSocket error:", error),
      onConnectionStateChange: (isConnected) => {
        console.log(
          "WebSocket connection state:",
          isConnected ? "connected" : "disconnected"
        );
      },
    });

    return () => {
      // Stop any ongoing speech when the component unmounts
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }

      // Clear any active timers
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Timer for recording duration
  useEffect(() => {
    if (isListening) {
      setRecordingDuration(0);
      timerRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isListening]);

  const startListening = async () => {
    try {
      setIsListening(true);
      setTranscript("");
      audioChunksRef.current = [];

      // Record audio using browser APIs
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.addEventListener("dataavailable", (event) => {
        audioChunksRef.current.push(event.data);
      });

      mediaRecorder.addEventListener("stop", async () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });

        try {
          setIsLoading(true);
          // Send the audio to the backend
          const response = await apiService.sendAudio(audioBlob);

          // Handle the response using the component-level handleMessage
          if (response) {
            handleMessage(response);
          }
        } catch (error) {
          console.error("Error sending audio:", error);
        } finally {
          stream.getTracks().forEach((track) => track.stop());
          setIsListening(false);
          setIsLoading(false);
        }
      });

      // Start recording - no automatic timeout now
      mediaRecorder.start();
    } catch (error) {
      console.error("Error accessing microphone:", error);
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
    }
  };

  // Format seconds into MM:SS format
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 shadow-sm border ${isDark ? 'border-gray-700' : 'border-gray-200'} ${className}`}>
      <div className="flex items-center space-x-3 mb-4">
        <OutlinedMicrophoneIcon className={`w-6 h-6 ${isDark ? 'text-blue-400' : 'text-blue-500'}`} />
        <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Voice Commands</h3>
      </div>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Start/Stop Assistant</span>
          <kbd className={`px-2 py-1 text-xs font-semibold ${isDark ? 'text-gray-200 bg-gray-700 border-gray-600' : 'text-gray-800 bg-gray-100 border-gray-300'} border rounded-md`}>
            Space
          </kbd>
        </div>
        <div className="flex items-center justify-between">
          <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Toggle Settings</span>
          <kbd className={`px-2 py-1 text-xs font-semibold ${isDark ? 'text-gray-200 bg-gray-700 border-gray-600' : 'text-gray-800 bg-gray-100 border-gray-300'} border rounded-md`}>
            ⌘,
          </kbd>
        </div>
        <div className="flex items-center justify-between">
          <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Toggle Theme</span>
          <kbd className={`px-2 py-1 text-xs font-semibold ${isDark ? 'text-gray-200 bg-gray-700 border-gray-600' : 'text-gray-800 bg-gray-100 border-gray-300'} border rounded-md`}>
            ⌘D
          </kbd>
        </div>
      </div>
      <div className="mt-4">
        <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
          {isListening
            ? `Listening... ${formatTime(recordingDuration)}`
            : isLoading
            ? "Processing..."
            : "Click the microphone to start speaking"}
        </p>
      </div>

      {transcript && (
        <div className={`mt-4 p-3 ${isDark ? 'bg-gray-700' : 'bg-gray-100'} rounded`}>
          <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'} italic`}>You said: "{transcript}"</p>
        </div>
      )}

      {feedback && (
        <div className={`mt-4 p-3 ${isDark ? 'bg-blue-900/30' : 'bg-blue-50'} rounded`}>
          <p className={`text-sm ${isDark ? 'text-blue-300' : 'text-blue-600'}`}>Assistant: "{feedback}"</p>
        </div>
      )}

      <div className="flex space-x-2 mt-4">
        {!isListening ? (
          <button
            onClick={startListening}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
              isDark 
                ? 'bg-blue-500 hover:bg-blue-600 text-white' 
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            } transition-colors`}
          >
            <MicrophoneIcon className="w-5 h-5" />
            <span>Start Recording</span>
          </button>
        ) : (
          <button
            onClick={stopListening}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
              isDark 
                ? 'bg-red-500 hover:bg-red-600 text-white' 
                : 'bg-red-500 hover:bg-red-600 text-white'
            } transition-colors`}
          >
            <StopIcon className="w-5 h-5" />
            <span>Stop Recording</span>
          </button>
        )}
      </div>

      {isListening && (
        <div className="mt-4 flex justify-center">
          <div className="flex space-x-1">
            <div
              className="w-2 h-8 bg-blue-500 rounded-full animate-bounce"
              style={{ animationDelay: "0ms" }}
            ></div>
            <div
              className="w-2 h-8 bg-blue-500 rounded-full animate-bounce"
              style={{ animationDelay: "100ms" }}
            ></div>
            <div
              className="w-2 h-8 bg-blue-500 rounded-full animate-bounce"
              style={{ animationDelay: "200ms" }}
            ></div>
            <div
              className="w-2 h-8 bg-blue-500 rounded-full animate-bounce"
              style={{ animationDelay: "300ms" }}
            ></div>
            <div
              className="w-2 h-8 bg-blue-500 rounded-full animate-bounce"
              style={{ animationDelay: "400ms" }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
};
